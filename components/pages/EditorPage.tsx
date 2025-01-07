"use client"

import Editor from "@/features/editor/Editor"
import { useEffect, useState } from "react"



export const EditorPage = () => {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setLoaded(true);
    }, [])

    return loaded ? (
        <Editor />
    ) : (
        <></>
    )
}
