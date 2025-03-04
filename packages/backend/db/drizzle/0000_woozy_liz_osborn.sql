CREATE TYPE "public"."direction" AS ENUM('vertical', 'horizontal');--> statement-breakpoint
CREATE TYPE "public"."handleType" AS ENUM('top', 'left', 'bottom', 'right');--> statement-breakpoint
CREATE TYPE "public"."shape_type" AS ENUM('page', 'button', 'inputField', 'text', 'checkbox', 'radio', 'toggle', 'card', 'image', 'dropdown', 'circle', 'chatbot', 'divider', 'navigation', 'instance', 'rectangle');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "datasets" (
	"dataset_id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"content" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"edited_at" timestamp DEFAULT now() NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "multipage_path" (
	"id" serial PRIMARY KEY NOT NULL,
	"projectId" integer NOT NULL,
	"shapeStartId" integer NOT NULL,
	"shapeStartHandleType" "handleType" NOT NULL,
	"shapeEndId" integer NOT NULL,
	"shapeEndHandleType" "handleType" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"edited_at" timestamp DEFAULT now() NOT NULL,
	"pageExcludeList" varchar[] DEFAULT ARRAY[]::text[] NOT NULL,
	"direction" "direction" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
	"project_id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"img_src" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"edited_at" timestamp DEFAULT now() NOT NULL,
	"iterations" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prototypes" (
	"prototype_id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"source_code" varchar NOT NULL,
	"thumbnail_img" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "button" (
	"shapeId" text PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"subtype" varchar NOT NULL,
	"size" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "card_children" (
	"id" serial PRIMARY KEY NOT NULL,
	"cardId" text NOT NULL,
	"childId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "card" (
	"shapeId" text PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" varchar NOT NULL,
	"hasInstances" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chatbot" (
	"shapeId" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "checkbox" (
	"shapeId" text PRIMARY KEY NOT NULL,
	"subtype" varchar NOT NULL,
	"label" varchar NOT NULL,
	"option1" varchar NOT NULL,
	"option2" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "circle" (
	"shapeId" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "divider" (
	"shapeId" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dropdown" (
	"shapeId" text PRIMARY KEY NOT NULL,
	"iconSrc" varchar NOT NULL,
	"option1" varchar NOT NULL,
	"option2" varchar NOT NULL,
	"option3" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "image" (
	"shapeId" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "input_field" (
	"shapeId" text PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "instance" (
	"shapeId" text PRIMARY KEY NOT NULL,
	"parentId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "navigation" (
	"shapeId" text PRIMARY KEY NOT NULL,
	"content" varchar NOT NULL,
	"fontColor" varchar NOT NULL,
	"fontSize" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "page" (
	"shapeId" text PRIMARY KEY NOT NULL,
	"subtype" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "radio" (
	"shapeId" text PRIMARY KEY NOT NULL,
	"subtype" varchar NOT NULL,
	"label" varchar NOT NULL,
	"option1" varchar NOT NULL,
	"option2" varchar NOT NULL,
	"option3" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rectangle" (
	"shapeId" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shapes" (
	"id" text PRIMARY KEY NOT NULL,
	"xOffset" double precision NOT NULL,
	"yOffset" double precision NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"minWidth" integer NOT NULL,
	"maxWidth" integer,
	"minHeight" integer NOT NULL,
	"maxHeight" integer,
	"isInstanceChild" boolean NOT NULL,
	"zIndex" integer NOT NULL,
	"projectId" integer NOT NULL,
	"type" "shape_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "text" (
	"shapeId" text PRIMARY KEY NOT NULL,
	"fontSize" varchar NOT NULL,
	"fontColor" varchar NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "toggle" (
	"shapeId" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "button_styles" (
	"id" serial PRIMARY KEY NOT NULL,
	"color" varchar,
	"textColor" varchar NOT NULL,
	"fontSize" varchar NOT NULL,
	"borderRadius" varchar NOT NULL,
	"paddingRight" varchar NOT NULL,
	"paddingLeft" varchar NOT NULL,
	"paddingTop" varchar NOT NULL,
	"paddingBottom" varchar NOT NULL,
	"borderColor" varchar NOT NULL,
	"borderWidth" varchar NOT NULL,
	"backgroundColor" varchar NOT NULL,
	"hoveredBackgroundColor" varchar NOT NULL,
	"hoveredTextColor" varchar NOT NULL,
	"isHovered" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "card_styles" (
	"id" serial PRIMARY KEY NOT NULL,
	"backgroundColor" varchar NOT NULL,
	"borderRadius" varchar NOT NULL,
	"border" varchar NOT NULL,
	"hoveredBackgroundColor" varchar NOT NULL,
	"color" varchar NOT NULL,
	"textColor" varchar NOT NULL,
	"mainCardPicture" boolean NOT NULL,
	"mainCardButton" boolean NOT NULL,
	"subCardPicture" boolean NOT NULL,
	"listCardBorderRadius" varchar NOT NULL,
	"listBackgroundColor" varchar NOT NULL,
	"listTextColor" varchar NOT NULL,
	"listColor" varchar NOT NULL,
	"listBorderRadius" varchar NOT NULL,
	"listShowAvatar" boolean NOT NULL,
	"listShowCheckbox" boolean NOT NULL,
	"listWidth" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "checkbox_styles" (
	"id" serial PRIMARY KEY NOT NULL,
	"backgroundColor" varchar NOT NULL,
	"border" varchar NOT NULL,
	"height" varchar NOT NULL,
	"width" varchar NOT NULL,
	"cursor" varchar NOT NULL,
	"borderRadius" varchar NOT NULL,
	"checkedBorder" varchar NOT NULL,
	"checkedColor" varchar NOT NULL,
	"checkedBackgroundColor" varchar NOT NULL,
	"checkedAlternateBorder" varchar NOT NULL,
	"checkedAlternateColor" varchar NOT NULL,
	"checkedAlternateBackgroundColor" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "internal_navigation_style" (
	"id" serial PRIMARY KEY NOT NULL,
	"internalBorderBottom" varchar NOT NULL,
	"internalBorderRadius" varchar NOT NULL,
	"internalPaddingBottom" varchar NOT NULL,
	"activeColor" varchar NOT NULL,
	"activeTextDecoration" varchar NOT NULL,
	"activeTextDecorationThickness" varchar NOT NULL,
	"activeMarginBottom" varchar NOT NULL,
	"activeTextDecorationOffset" varchar NOT NULL,
	"activeBorderBottom" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "radio_button_styles" (
	"id" serial PRIMARY KEY NOT NULL,
	"height" varchar NOT NULL,
	"width" varchar NOT NULL,
	"borderColor" varchar NOT NULL,
	"borderWidth" varchar NOT NULL,
	"borderRadius" varchar NOT NULL,
	"borderColorChecked" varchar NOT NULL,
	"color" varchar NOT NULL,
	"customIconHeight" varchar NOT NULL,
	"customIconWidth" varchar NOT NULL,
	"customIconBackgroundColor" varchar NOT NULL,
	"customIconBorderRadius" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "button_label" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" varchar NOT NULL,
	"segmentedButtonStylesId" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "segmented_button_styles" (
	"id" serial PRIMARY KEY NOT NULL,
	"activeBgColor" varchar NOT NULL,
	"inactiveBgColor" varchar NOT NULL,
	"activeTextColor" varchar NOT NULL,
	"inactiveTextColor" varchar NOT NULL,
	"borderColor" varchar NOT NULL,
	"hoverBgColor" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "neutral_color_styles" (
	"id" serial PRIMARY KEY NOT NULL,
	"firstColor" varchar NOT NULL,
	"secondColor" varchar NOT NULL,
	"thirdColor" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "secondary_color_styles" (
	"id" serial PRIMARY KEY NOT NULL,
	"firstColor" varchar NOT NULL,
	"secondColor" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "styleguides" (
	"styleguideId" serial PRIMARY KEY NOT NULL,
	"buttonPrimaryId" serial NOT NULL,
	"buttonSecondaryId" serial NOT NULL,
	"buttonTertiaryId" serial NOT NULL,
	"buttonGhostId" serial NOT NULL,
	"cardStylesId" serial NOT NULL,
	"checkboxStylesId" serial NOT NULL,
	"primaryColor" varchar NOT NULL,
	"secondaryColorStylesId" serial NOT NULL,
	"neutralColorStylesId" serial NOT NULL,
	"radioButtonStylesId" serial NOT NULL,
	"filename" varchar,
	"typographyStylesId" serial NOT NULL,
	"textFieldStylesId" serial NOT NULL,
	"toggleStylesId" serial NOT NULL,
	"internalNavigationStylesId" serial NOT NULL,
	"segmentedButtonStylesId" serial NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"editedAt" timestamp DEFAULT now() NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"userId" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "text_field_styles" (
	"id" serial PRIMARY KEY NOT NULL,
	"inputStylePadding" varchar NOT NULL,
	"inputStyleBorderWidth" varchar NOT NULL,
	"inputStyleBorderColor" varchar NOT NULL,
	"inputStyleBorderStyle" varchar NOT NULL,
	"inputStyleBorderRadius" varchar NOT NULL,
	"inputStylePosition" varchar NOT NULL,
	"inputStyleBackgroundColor" varchar NOT NULL,
	"inputStyleClearable" boolean NOT NULL,
	"inputStyleBorderColorChecked" varchar NOT NULL,
	"labelStylePosition" varchar NOT NULL,
	"labelStyleBackgroundColor" varchar NOT NULL,
	"labelStyleZIndex" varchar NOT NULL,
	"labelStyleMarginTop" varchar NOT NULL,
	"labelStyleMarginLeft" varchar NOT NULL,
	"labelStylePadding" varchar NOT NULL,
	"supportingTextStyleFontSize" varchar NOT NULL,
	"supportingTextStyleColor" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "toggle_styles_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"isChecked" boolean NOT NULL,
	"checkedBackgroundColor" varchar NOT NULL,
	"uncheckedBackgroundColor" varchar NOT NULL,
	"checkedButtonColor" varchar NOT NULL,
	"uncheckedButtonColor" varchar NOT NULL,
	"checkedBorderColor" varchar NOT NULL,
	"uncheckedBorderColor" varchar NOT NULL,
	"checkedThumbSize" varchar NOT NULL,
	"uncheckedThumbSize" varchar NOT NULL,
	"styleJSON" varchar NOT NULL,
	"borderRadius" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "typography_styles" (
	"id" serial PRIMARY KEY NOT NULL,
	"customizationEnabledFont" boolean NOT NULL,
	"selectedFont" varchar NOT NULL,
	"h1Size" varchar NOT NULL,
	"h2Size" varchar NOT NULL,
	"h3Size" varchar NOT NULL,
	"h4Size" varchar NOT NULL,
	"h5Size" varchar NOT NULL,
	"h6Size" varchar NOT NULL,
	"paragraphSize" varchar NOT NULL,
	"linkSize" varchar NOT NULL,
	"h1Weight" varchar NOT NULL,
	"h2Weight" varchar NOT NULL,
	"h3Weight" varchar NOT NULL,
	"h4Weight" varchar NOT NULL,
	"h5Weight" varchar NOT NULL,
	"h6Weight" varchar NOT NULL,
	"paragraphWeight" varchar NOT NULL,
	"linkWeight" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"username" varchar NOT NULL,
	"profile_picture_src" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "datasets" ADD CONSTRAINT "datasets_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "multipage_path" ADD CONSTRAINT "multipage_path_projectId_projects_project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("project_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prototypes" ADD CONSTRAINT "prototypes_project_id_projects_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("project_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "button" ADD CONSTRAINT "button_shapeId_shapes_id_fk" FOREIGN KEY ("shapeId") REFERENCES "public"."shapes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "card_children" ADD CONSTRAINT "card_children_cardId_card_shapeId_fk" FOREIGN KEY ("cardId") REFERENCES "public"."card"("shapeId") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "card_children" ADD CONSTRAINT "card_children_childId_shapes_id_fk" FOREIGN KEY ("childId") REFERENCES "public"."shapes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "card" ADD CONSTRAINT "card_shapeId_shapes_id_fk" FOREIGN KEY ("shapeId") REFERENCES "public"."shapes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chatbot" ADD CONSTRAINT "chatbot_shapeId_shapes_id_fk" FOREIGN KEY ("shapeId") REFERENCES "public"."shapes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "checkbox" ADD CONSTRAINT "checkbox_shapeId_shapes_id_fk" FOREIGN KEY ("shapeId") REFERENCES "public"."shapes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "circle" ADD CONSTRAINT "circle_shapeId_shapes_id_fk" FOREIGN KEY ("shapeId") REFERENCES "public"."shapes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "divider" ADD CONSTRAINT "divider_shapeId_shapes_id_fk" FOREIGN KEY ("shapeId") REFERENCES "public"."shapes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dropdown" ADD CONSTRAINT "dropdown_shapeId_shapes_id_fk" FOREIGN KEY ("shapeId") REFERENCES "public"."shapes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "image" ADD CONSTRAINT "image_shapeId_shapes_id_fk" FOREIGN KEY ("shapeId") REFERENCES "public"."shapes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "input_field" ADD CONSTRAINT "input_field_shapeId_shapes_id_fk" FOREIGN KEY ("shapeId") REFERENCES "public"."shapes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "instance" ADD CONSTRAINT "instance_shapeId_shapes_id_fk" FOREIGN KEY ("shapeId") REFERENCES "public"."shapes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "instance" ADD CONSTRAINT "instance_parentId_shapes_id_fk" FOREIGN KEY ("parentId") REFERENCES "public"."shapes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "navigation" ADD CONSTRAINT "navigation_shapeId_shapes_id_fk" FOREIGN KEY ("shapeId") REFERENCES "public"."shapes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "page" ADD CONSTRAINT "page_shapeId_shapes_id_fk" FOREIGN KEY ("shapeId") REFERENCES "public"."shapes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "radio" ADD CONSTRAINT "radio_shapeId_shapes_id_fk" FOREIGN KEY ("shapeId") REFERENCES "public"."shapes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rectangle" ADD CONSTRAINT "rectangle_shapeId_shapes_id_fk" FOREIGN KEY ("shapeId") REFERENCES "public"."shapes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shapes" ADD CONSTRAINT "shapes_projectId_projects_project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("project_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "text" ADD CONSTRAINT "text_shapeId_shapes_id_fk" FOREIGN KEY ("shapeId") REFERENCES "public"."shapes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "toggle" ADD CONSTRAINT "toggle_shapeId_shapes_id_fk" FOREIGN KEY ("shapeId") REFERENCES "public"."shapes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "button_label" ADD CONSTRAINT "button_label_segmentedButtonStylesId_segmented_button_styles_id_fk" FOREIGN KEY ("segmentedButtonStylesId") REFERENCES "public"."segmented_button_styles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "styleguides" ADD CONSTRAINT "styleguides_buttonPrimaryId_button_styles_id_fk" FOREIGN KEY ("buttonPrimaryId") REFERENCES "public"."button_styles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "styleguides" ADD CONSTRAINT "styleguides_buttonSecondaryId_button_styles_id_fk" FOREIGN KEY ("buttonSecondaryId") REFERENCES "public"."button_styles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "styleguides" ADD CONSTRAINT "styleguides_buttonTertiaryId_button_styles_id_fk" FOREIGN KEY ("buttonTertiaryId") REFERENCES "public"."button_styles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "styleguides" ADD CONSTRAINT "styleguides_buttonGhostId_button_styles_id_fk" FOREIGN KEY ("buttonGhostId") REFERENCES "public"."button_styles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "styleguides" ADD CONSTRAINT "styleguides_cardStylesId_card_styles_id_fk" FOREIGN KEY ("cardStylesId") REFERENCES "public"."card_styles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "styleguides" ADD CONSTRAINT "styleguides_checkboxStylesId_checkbox_styles_id_fk" FOREIGN KEY ("checkboxStylesId") REFERENCES "public"."checkbox_styles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "styleguides" ADD CONSTRAINT "styleguides_secondaryColorStylesId_secondary_color_styles_id_fk" FOREIGN KEY ("secondaryColorStylesId") REFERENCES "public"."secondary_color_styles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "styleguides" ADD CONSTRAINT "styleguides_neutralColorStylesId_neutral_color_styles_id_fk" FOREIGN KEY ("neutralColorStylesId") REFERENCES "public"."neutral_color_styles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "styleguides" ADD CONSTRAINT "styleguides_radioButtonStylesId_radio_button_styles_id_fk" FOREIGN KEY ("radioButtonStylesId") REFERENCES "public"."radio_button_styles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "styleguides" ADD CONSTRAINT "styleguides_typographyStylesId_typography_styles_id_fk" FOREIGN KEY ("typographyStylesId") REFERENCES "public"."typography_styles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "styleguides" ADD CONSTRAINT "styleguides_textFieldStylesId_text_field_styles_id_fk" FOREIGN KEY ("textFieldStylesId") REFERENCES "public"."text_field_styles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "styleguides" ADD CONSTRAINT "styleguides_toggleStylesId_toggle_styles_config_id_fk" FOREIGN KEY ("toggleStylesId") REFERENCES "public"."toggle_styles_config"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "styleguides" ADD CONSTRAINT "styleguides_internalNavigationStylesId_internal_navigation_style_id_fk" FOREIGN KEY ("internalNavigationStylesId") REFERENCES "public"."internal_navigation_style"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "styleguides" ADD CONSTRAINT "styleguides_segmentedButtonStylesId_segmented_button_styles_id_fk" FOREIGN KEY ("segmentedButtonStylesId") REFERENCES "public"."segmented_button_styles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "styleguides" ADD CONSTRAINT "styleguides_userId_users_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
