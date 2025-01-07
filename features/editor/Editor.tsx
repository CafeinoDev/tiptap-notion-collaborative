"use client"

import {
    memo,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { EditorContent, useEditor } from "@tiptap/react";
import { useAtom } from "jotai";
import useCollaborationURL from "./hooks/use-collaboration-url";
import { pageEditorAtom } from "@/features/editor/atoms/editor-atoms";
import { mainExtensions, collabExtensions } from "@/features/editor/extensions/extensions";
import { EditorBubbleMenu } from "@/features/editor/components/bubble-menu/bubble-menu";
import TableMenu from "@/features/editor/components/table/table-menu";
import TableCellMenu from "@/features/editor/components/table/table-cell-menu";
import CalloutMenu from "@/features/editor/components/callout/callout-menu";
import ExcalidrawMenu from "@/features/editor/components/excalidraw/excalidraw-menu";
import DrawioMenu from "@/features/editor/components/drawio/drawio-menu";
import LinkMenu from "@/features/editor/components/link/link-menu";
import EditorSkeleton from "@/features/editor/components/editor-skeleton";
import { handleFileDrop, handleFilePaste } from "@/features/editor/components/common/file-upload-handler";
import { randomElement } from "./extensions/utils";

const defaultNames = ["SolidSnake", "Dante", "MasterChief", "SamusAran", "LaraCroft", "Geralt", "Kratos", "Link", "Mario", "Zelda"];

const EditorComponent = () => {
    const pageId = "test-page";
    const documentName = 'editor-document';
    const collaborationURL = useCollaborationURL();
    const [, setEditor] = useAtom(pageEditorAtom);
    const [isLocalSynced, setLocalSynced] = useState(false);
    const [isRemoteSynced, setRemoteSynced] = useState(false);
    const ydoc = useMemo(() => new Y.Doc(), []);
    const menuContainerRef = useRef(null);


    const localProvider = useMemo(() => {
        if (typeof indexedDB !== 'undefined') {
            const provider = new IndexeddbPersistence(documentName, ydoc);

            provider.on("synced", () => {
                setLocalSynced(true);
            });

            return provider;
        } else {
            console.warn("IndexedDB is not available in this environment.");
            setLocalSynced(true);
        }
    }, [ydoc]);

    const remoteProvider = useMemo(() => {
        const provider = new HocuspocusProvider({
            name: documentName,
            url: collaborationURL,
            document: ydoc,
            token: "test-token",
            connect: true,
        });

        provider.on("synced", () => {
            setRemoteSynced(true);
        });

        return provider;
    }, [ydoc, pageId]);

    useEffect(() => () => {
        setRemoteSynced(false);
        setLocalSynced(false);
        remoteProvider.destroy();
        localProvider?.destroy();
    }, []);

    const extensions = [
        ...mainExtensions,
        ...collabExtensions(remoteProvider, {
            name: randomElement(defaultNames),
        }),
    ];

    const editor = useEditor(
        {
            extensions,
            immediatelyRender: false,
            editorProps: {
                handleDOMEvents: {
                    keydown: (_view, event) => {
                        if (["ArrowUp", "ArrowDown", "Enter"].includes(event.key)) {
                            const slashCommand = document.querySelector("#slash-command");
                            if (slashCommand) {
                                return true;
                            }
                        }
                    },
                },
                handlePaste: (view, event) => handleFilePaste(view, event, documentName),
                handleDrop: (view, event, _slice, moved) =>
                    handleFileDrop(view, event, moved, documentName),
            },
            onCreate({ editor }) {
                if (editor) {
                    setEditor(editor);
                    editor.storage.pageId = documentName;
                }
            },
        },
        [],
    );

    const isSynced = isLocalSynced || isRemoteSynced;

    return isSynced ? (
        <div className="editor-canvas">
            {isSynced && (
                <div ref={menuContainerRef}>
                    <EditorContent editor={editor} />

                    {editor && editor.isEditable && (
                        <div>
                            <EditorBubbleMenu editor={editor} />
                            <TableMenu editor={editor} />
                            <TableCellMenu editor={editor} appendTo={menuContainerRef} />
                            <CalloutMenu editor={editor} />
                            <ExcalidrawMenu editor={editor} />
                            <DrawioMenu editor={editor} />
                            <LinkMenu editor={editor} appendTo={menuContainerRef} />
                        </div>
                    )}
                </div>
            )}
            <div onClick={() => editor?.commands.focus('end')} style={{ paddingBottom: '20vh' }}></div>
        </div>
    ) : (
        <EditorSkeleton />
    );
}

export default memo(EditorComponent);