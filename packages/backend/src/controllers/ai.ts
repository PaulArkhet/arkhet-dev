import type { Request, Response } from 'express';
// import { runApp } from '../ai/langgraph';
import { z } from 'zod';
import path from 'path';
import { Server, Socket } from 'socket.io';
import { performance } from 'perf_hooks';
import { wireframeSchemaItem } from '../interfaces/artboard';
import {
  readTsxFiles,
  removeFileExtension,
  resizeImage,
} from '../utils/helpers';
import fs from 'fs';
import { styleGuideAi } from '../ai/langchain-styleguide';
import { styleguideSelectParser } from '../services/styleguide.service';
import { runQStarGeneration } from '../ai/q-star/qStarGenerate';

const pageStructureSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  componentsWithNavigationElements: z.array(
    wireframeSchemaItem.and(
      z.object({ path: z.optional(z.object({ targetPageId: z.string() })) })
    )
  ),
  base64ImageString: z.string(),
});

export type PageStructure = z.infer<typeof pageStructureSchema>;

export const genParamsSchema = z.object({
  pageStructure: z.array(pageStructureSchema),
  images: z.array(z.string()),
  styleguide: styleguideSelectParser,
  initialCode: z.optional(z.string()),
});

export type GenParams = z.infer<typeof genParamsSchema>;
export async function startGeneration(params: GenParams, socket: Socket) {
  console.log('running app...');
  console.log(params);
  console.time(socket.id);
  const startTime = performance.now();
  // await runApp(params.pageStructure, socket, params);
  //await runTraining(socket, params);
  await runQStarGeneration(socket, params);
  const endTime = performance.now();

  socket.emit('notification', {
    id: 99999999999,
    title: 'Generation finished!',
    body: `Time elapsed: ${((endTime - startTime) / 1000).toFixed(2)} seconds.`,
  });
  socket.emit('done', { message: 'done' });
  console.log('app done!');
  return;
}

// refactor to take a socket instance
export const uploadStyleGuide = async (
  req: Request,
  res: Response,
  io: Server
): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  try {
    const uploadedFile = req.file as Express.Multer.File;
    const fileMimeType = uploadedFile.mimetype;

    let resizedFile = null;

    console.log('uploadedFile', uploadedFile);
    if (fileMimeType === 'image/png' || fileMimeType === 'image/jpeg') {
      const outputFilePath = path.join(
        __dirname,
        '../../uploads',
        `resized-${uploadedFile.filename}`
      );

      await resizeImage(uploadedFile.path, outputFilePath);

      const fileBuffer = fs.readFileSync(outputFilePath).toString('base64');
      const base64Image = `data:${fileMimeType};base64,${fileBuffer}`;

      resizedFile = {
        fileName: uploadedFile.originalname,
        content: base64Image,
        fileType: fileMimeType,
      };
    }

    if (!resizedFile) {
      res.status(400).json({ error: 'Invalid file type uploaded' });
      return;
    }

    res.json({ message: 'File uploaded, processing started.' });

    const typographyComponent = await styleGuideAi(
      {
        fileName: 'typography',
        content: 'There is no component to pass.',
      },
      resizedFile.content
    );

    if (typographyComponent) {
      io.emit('styledComponent', {
        fileName: 'typography',
        styledComponent: typographyComponent,
      });
    }

    const colorComponent = await styleGuideAi(
      { fileName: 'color', content: 'There is no component to pass.' },
      resizedFile.content
    );

    if (colorComponent) {
      io.emit('styledComponent', {
        fileName: 'color',
        styledComponent: colorComponent,
      });
    }

    const componentDirPath = path.join(__dirname, '../../custom-ui-server');
    const txtFiles = await readTsxFiles(componentDirPath);

    for (const txtFile of txtFiles) {
      const styledComponent = await styleGuideAi(
        { fileName: txtFile.fileName, content: txtFile.content },
        resizedFile.content
      );

      if (styledComponent) {
        io.emit('styledComponent', {
          fileName: removeFileExtension(txtFile.fileName),
          styledComponent: styledComponent,
        });
      }
    }

    io.emit('done', { message: 'All components processed.' });
  } catch (error) {
    console.error('Error processing file:', error);
    io.emit('error', { message: 'Error processing file' });
    res.status(500).json({ error: 'Internal server error' });
  }
};
