"use client";

import { Suspense, useEffect } from "react";
import { EditorToolbar } from "./toolbar/editor-toolbar";
import { SceneCanvas } from "./canvas/scene-canvas";
import { FurnitureCatalogBar } from "./panels/furniture-catalog-bar";
import { FurniturePanel } from "./panels/furniture-panel";
import { PropertiesPanel } from "./panels/properties-panel";
import { FengShuiPanel } from "./panels/feng-shui-panel";
import { RoomSettingsDialog } from "./dialogs/room-settings-dialog";
import { ChatDock } from "@/components/features/chat/chat-dock";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { MobileBottomSheet } from "./mobile-bottom-sheet";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useProject } from "@/hooks/use-project";
import { useConversations } from "@/hooks/use-conversations";
import { useChatStore } from "@/stores/chat-store";
import { useEditorStore } from "@/stores/editor-store";

interface EditorWorkspaceProps {
  projectId: string;
}

export function EditorWorkspace({ projectId }: EditorWorkspaceProps) {
  const { load } = useProject(projectId);
  const setProjectId = useChatStore((s) => s.setProjectId);
  const setConversationId = useChatStore((s) => s.setConversationId);
  const setProjectName = useEditorStore((s) => s.setProjectName);
  const conversationId = useChatStore((s) => s.conversationId);
  const chatOpen = useChatStore((s) => s.isOpen);
  const { loadMessages } = useConversations();

  useEffect(() => {
    setProjectId(projectId);
    setConversationId(null);
    setProjectName(null);
    load();
    return () => {
      setProjectId(null);
      setProjectName(null);
    };
  }, [load, projectId, setProjectId, setConversationId, setProjectName]);

  useEffect(() => {
    if (conversationId) loadMessages(conversationId);
  }, [conversationId, loadMessages]);

  return (
    <div className="relative h-full w-full">


      <EditorToolbar
        projectId={projectId}
      />

      {/* Desktop: canvas is fullscreen; chat + catalog overlay on top */}
      <div className="absolute inset-0 top-10 bottom-14 hidden lg:top-12 lg:bottom-0 lg:block">
        {/* Canvas — fills entire workspace, does not resize with overlays */}
        <div className="absolute inset-0">
          <ErrorBoundary>
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center bg-muted">
                  <div className="text-center">
                    <LoadingSpinner size="lg" className="mx-auto" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      กำลังโหลดโปรแกรมแก้ไข 3 มิติ...
                    </p>
                  </div>
                </div>
              }
            >
              <SceneCanvas />
            </Suspense>
          </ErrorBoundary>
        </div>

        {/* Floating panels overlay the canvas */}
        <PropertiesPanel />
        <FengShuiPanel />

        {/* Right: chat dock overlay */}
        <div className="absolute right-0 top-0 bottom-0 z-10">
          <ChatDock />
        </div>

        {/* Bottom: furniture catalog bar overlay — stops before the chat dock */}
        <div
          className={`absolute bottom-0 left-0 z-10 ${chatOpen ? "right-96" : "right-12"}`}
        >
          <FurnitureCatalogBar projectId={projectId} />
        </div>
      </div>

      {/* Mobile: use existing mobile flow (canvas fullscreen + bottom nav/sheet) */}
      <div className="absolute inset-0 top-10 bottom-14 lg:hidden">
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center bg-muted">
                <div className="text-center">
                  <LoadingSpinner size="lg" className="mx-auto" />
                </div>
              </div>
            }
          >
            <SceneCanvas />
          </Suspense>
        </ErrorBoundary>
      </div>

      <RoomSettingsDialog projectId={projectId} />

      {/* Mobile-only panels */}
      <div className="lg:hidden">
        <FurniturePanel />
        <MobileBottomNav />
        <MobileBottomSheet />
      </div>
    </div>
  );
}
