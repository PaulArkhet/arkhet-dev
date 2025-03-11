import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useTypographyStore } from "../../store/useTypographyStore";
import { useColorPaletteStore } from "../../store/useColorPaletteStore";
import { useButtonStore } from "../../store/useButtonStore";
import { useTextFieldStore } from "../../store/useTextFieldStore";
import ColorSection from "../../components/design-system/sections/ColorSection";
import ButtonSection from "../../components/design-system/sections/ButtonSection";
import TypographySection from "../../components/design-system/sections/TypographySection";
import TextFieldSection from "../../components/design-system/sections/TextFieldSection";
import ToggleSection from "../../components/design-system/sections/ToggleSection";
import CheckBoxSection from "../../components/design-system/sections/CheckBoxSection";
import InternalNavigationSection from "../../components/design-system/sections/InternalNavigationSection";
import SegmentedButtonSection from "../../components/design-system/sections/SegmentedButtonSection";
import CardSection from "../../components/design-system/sections/CardSection";
import ListSection from "../../components/design-system/sections/ListSection";
import { toast } from "../../hooks/use-toast";
import SkeletonComponent from "../../components/design-system/components/Skeleton";
import { Input } from "../../components/ui/input";
import {
  capitalizeFontFamily,
  LoadingState,
  removeFileExtension,
  resetAllLoading,
} from "../../utils/helpers";
import RadioButtonSection from "../../components/design-system/sections/RadioButtonSection";
import CustomizationSection from "../../components/design-system/sections/CustomizationSection";
import { useToggleStore } from "../../store/useToggleStore";
import { useInternalNavigationStore } from "../../store/useInternalNavigationStore";
import { useCardStore } from "../../store/useCardStore";
import { useRadioButtonStore } from "../../store/useRadioButtonStore";
import { useCheckBoxStore } from "../../store/useCheckBoxStore";
import { useSegmentedButtonStore } from "../../store/useSegmentedButtonStore";
// import { getUserIdFromToken } from "../../services/jwt.service";
// import { saveStyleGuide } from "../../services/styleGuideService";
// import { loadSavedStyleGuide } from "../../utils/styleGuideUtils";
// import useUpdateUIComponentStyles from "../../hooks/useUpdateUIComponentStyles";
import { useSectionSearch } from "../../hooks/useSectionSearch";
import { useUploadedStyleGuideStore } from "../../store/useUploadedStyleGuideStore";
import Divider from "../../components/design-system/components/Divider";
import { useQuery } from "@tanstack/react-query";
import {
  getAllStyleguidesQueryOptions,
  useCreateStyleguideMutation,
} from "@/lib/api/styleguides";

export const Route = createLazyFileRoute(
  "/_authenticated/_sidenav/design-system"
)({
  component: DesignSystem,
});

function DesignSystem() {
  const { user } = Route.useRouteContext();

  const [loading, setLoading] = useState<LoadingState>({
    styleGuideName: false,
    typography: false,
    color: false,
    button: false,
    radioButton: false,
    textField: false,
    toggle: false,
    checkBox: false,
    internalNavigation: false,
    segmentedButton: false,
    card: false,
    list: false,
  });
  const [search, setSearch] = useState("");

  const { updateActiveHeader } = useTypographyStore();
  const { setButtonType } = useButtonStore();
  const { setCustomizationTextField } = useTextFieldStore();
  const { setCustomizationToggle } = useToggleStore();
  const { setCustomizationInternalNavigation } = useInternalNavigationStore();
  const { setCustomizationEnabledCard } = useCardStore();
  const { updateCurrentlyDisplayingStyleGuide } = useUploadedStyleGuideStore();

  const sections = {
    typography: useRef<HTMLDivElement>(null),
    color: useRef<HTMLDivElement>(null),
    buttons: useRef<HTMLDivElement>(null),
    radioButton: useRef<HTMLDivElement>(null),
    textField: useRef<HTMLDivElement>(null),
    toggle: useRef<HTMLDivElement>(null),
    checkBox: useRef<HTMLDivElement>(null),
    internalNavigation: useRef<HTMLDivElement>(null),
    segmentedButton: useRef<HTMLDivElement>(null),
    card: useRef<HTMLDivElement>(null),
    list: useRef<HTMLDivElement>(null),
  };

  useSectionSearch(search, sections);

  const socketRef = useRef<any>(null);

  const {
    data: styleguideQueryData,
    isPending: isStyleguideQueryPending,
    error: styleguideQueryError,
  } = useQuery(getAllStyleguidesQueryOptions);

  useEffect(() => {
    if (!styleguideQueryData) return;
    updateCurrentlyDisplayingStyleGuide(styleguideQueryData[0]);
  }, [styleguideQueryData, isStyleguideQueryPending, styleguideQueryError]);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log("Socket.IO connection closed on page reload.");
      }
    };
  }, []);

  const handleUploadClick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    return;
  };

  const handleFailure = (message: string) => {
    setLoading(resetAllLoading(loading, false));
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
      duration: 5000,
    });
  };

  return (
    <div className="w-full">
      <div className="px-5 border-b border-b-zinc-700">
        <h2 className="font text-sm mb-8">Design System</h2>
      </div>
      <main className="flex">
        <div className="flex flex-col flex-wrap basis-4/5">
          <div className="px-10 mt-10 flex justify-between items-center">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                className="border-none tracking-[.25em]"
                type="text"
                placeholder="SEARCH COMPONENTS..."
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
              />
            </div>
            <div className="px-4 py-1 text-sm rounded-3xl border border-purple-500 text-purple-500 text-center justify-center hover:cursor-pointer flex flex-row gap-1">
              <div>
                <svg
                  width="16"
                  height="19"
                  viewBox="0 0 16 19"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.42857 0C1.53571 0 0 1.53571 0 3.42857V14.8571C0 16.75 1.53571 18.2857 3.42857 18.2857H13.7143H14.8571C15.4893 18.2857 16 17.775 16 17.1429C16 16.5107 15.4893 16 14.8571 16V13.7143C15.4893 13.7143 16 13.2036 16 12.5714V1.14286C16 0.510714 15.4893 0 14.8571 0H13.7143H3.42857ZM3.42857 13.7143H12.5714V16H3.42857C2.79643 16 2.28571 15.4893 2.28571 14.8571C2.28571 14.225 2.79643 13.7143 3.42857 13.7143ZM4.57143 5.14286C4.57143 4.82857 4.82857 4.57143 5.14286 4.57143H12C12.3143 4.57143 12.5714 4.82857 12.5714 5.14286C12.5714 5.45714 12.3143 5.71429 12 5.71429H5.14286C4.82857 5.71429 4.57143 5.45714 4.57143 5.14286ZM5.14286 6.85714H12C12.3143 6.85714 12.5714 7.11429 12.5714 7.42857C12.5714 7.74286 12.3143 8 12 8H5.14286C4.82857 8 4.57143 7.74286 4.57143 7.42857C4.57143 7.11429 4.82857 6.85714 5.14286 6.85714Z"
                    fill="#9253E4"
                  />
                </svg>
              </div>

              <label htmlFor="fileUpload" className="cursor-pointer">
                Upload Design System
              </label>
              <input
                id="fileUpload"
                type="file"
                accept="image/png, image/jpg, image/jpeg"
                onChange={handleUploadClick}
                className="hidden"
              />
            </div>
          </div>
          <Divider hrOption="border-zinc-700" divOption="py-1" />
          <div className="px-2 ml-2 2xl:px-3 2xl:ml-4 mt-10">
            <div className="section-styling" ref={sections.color}>
              <div className="w-40">
                <h1 className="text-white text-sm tracking-[.20em] font-semibold">
                  COLORS
                </h1>
              </div>

              {isStyleguideQueryPending || styleguideQueryError ? (
                <SkeletonComponent type="color" />
              ) : (
                <ColorSection styleguide={styleguideQueryData[0]} />
              )}
            </div>
            <div
              className="section-styling"
              ref={sections.typography}
              /*
              onClick={() => {
                updateActiveHeader("");
              }}
              */
            >
              <div className="w-40">
                <h1 className="text-white text-sm tracking-[.20em] font-semibold">
                  TYPOGRAPHY
                </h1>
              </div>

              {isStyleguideQueryPending || styleguideQueryError ? (
                <SkeletonComponent type="typography" />
              ) : (
                <TypographySection styleguide={styleguideQueryData[0]} />
              )}
            </div>
            <div className="relative z-20 text-center pb-10 text-xl text-[#BF94F7]">
              Coming Soon
            </div>
            <div className="absolute top-[1000px] left-0 z-10 w-full bg-black opacity-50 h-[1290px]"></div>
            <div ref={sections.buttons} className="section-styling">
              <div className="w-40">
                <h1 className="text-white text-sm tracking-[.20em] font-semibold">
                  BUTTON
                </h1>
              </div>
              {loading.button ? (
                <SkeletonComponent type="button" />
              ) : (
                <ButtonSection />
              )}
            </div>
            <div ref={sections.buttons} className="section-styling">
              <div className="w-40">
                <h1 className="text-white text-sm tracking-[.20em] font-semibold">
                  RADIO BUTTON
                </h1>
              </div>
              {loading.radioButton ? (
                <SkeletonComponent type="radioButton" />
              ) : (
                <RadioButtonSection />
              )}
            </div>
            <div
              ref={sections.checkBox}
              onClick={() => {
                setCustomizationToggle(true);
                setCustomizationTextField(false);
                setCustomizationInternalNavigation(false);
                setButtonType("");
              }}
              className="section-styling"
            >
              <div className="w-40">
                <h1 className="text-white text-sm tracking-[.20em] font-semibold">
                  CHECK BOX
                </h1>
              </div>
              {loading.checkBox ? (
                <SkeletonComponent type="checkbox" />
              ) : (
                <CheckBoxSection />
              )}
            </div>
            <div
              ref={sections.toggle}
              onClick={() => {
                setCustomizationToggle(true);
                setCustomizationTextField(false);
                setCustomizationInternalNavigation(false);
              }}
              className="section-styling"
            >
              <div className="w-40">
                <h1 className="text-white text-sm tracking-[.20em] font-semibold">
                  TOGGLE
                </h1>
              </div>
              {loading.toggle ? (
                <SkeletonComponent type="toggle" />
              ) : (
                <ToggleSection />
              )}
            </div>
            <div
              ref={sections.textField}
              onClick={() => {
                setCustomizationTextField(true);
                setCustomizationToggle(false);
                setCustomizationInternalNavigation(false);
                setButtonType("");
              }}
              className="section-styling"
            >
              <div className="w-40">
                <h1 className="text-white text-sm tracking-[.20em] font-semibold">
                  INPUT FIELD
                </h1>
              </div>
              {loading.textField ? (
                <SkeletonComponent type="textField" />
              ) : (
                <TextFieldSection />
              )}
            </div>
            <div
              onClick={() => {
                setCustomizationInternalNavigation(true);
                setCustomizationTextField(false);
                setCustomizationToggle(false);
                setButtonType("");
              }}
              className="gap-3 pb-16 flex flex-row"
              ref={sections.internalNavigation}
            >
              <div className="w-40">
                <h1 className="text-white text-sm tracking-[.20em] font-semibold">
                  NAVIGATION
                </h1>
              </div>
              <div className="gap-3 pb-16 xl:flex xl:flex-row">
                <div>
                  <h1 className="text-white text-sm tracking-[.20em] font-semibold mb-5">
                    INTERNAL NAVIGATION
                  </h1>
                  {loading.internalNavigation ? (
                    <SkeletonComponent type="internalNavigation" />
                  ) : (
                    <InternalNavigationSection />
                  )}
                </div>
                <div ref={sections.segmentedButton}>
                  <h1 className="text-white text-sm tracking-[.20em] font-semibold mb-5">
                    SEGMENTED BUTTON
                  </h1>
                  {loading.segmentedButton ? (
                    <SkeletonComponent type="segmentedButton" />
                  ) : (
                    <SegmentedButtonSection />
                  )}
                </div>
              </div>
            </div>

            <div
              ref={sections.card}
              className="section-styling"
              onClick={() => {
                setCustomizationEnabledCard(true);
                setCustomizationInternalNavigation(false);
                setCustomizationTextField(false);
                setCustomizationToggle(false);
                setButtonType("");
              }}
            >
              <div className="w-40">
                <h1 className="text-white text-sm tracking-[.20em] font-semibold">
                  LIST
                </h1>
              </div>

              {loading.card ? (
                <SkeletonComponent type="card" />
              ) : (
                <>
                  <CardSection /> <ListSection />
                </>
              )}
            </div>
          </div>
        </div>
        <CustomizationSection />
      </main>
    </div>
  );
}
