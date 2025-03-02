"use client"

import { MantineProvider } from "@mantine/core"
import { theme } from "./theme"

export const Providers = ({
    children
}: {
    children: React.ReactNode
}) => {
    return (
        <MantineProvider theme={theme}>
            {children}
        </MantineProvider>
    )
}
