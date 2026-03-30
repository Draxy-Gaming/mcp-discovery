import { z } from 'zod';
export declare const ToolSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    inputSchema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
export declare const ResourceSchema: z.ZodObject<{
    uri: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    mimeType: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const McpDiscoverySchema: z.ZodObject<{
    mcpVersion: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    homepage: z.ZodOptional<z.ZodString>;
    tools: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        inputSchema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.core.$strip>>>;
    resources: z.ZodOptional<z.ZodArray<z.ZodObject<{
        uri: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        mimeType: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    prompts: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    auth: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<{
            basic: "basic";
            none: "none";
            oauth2: "oauth2";
            apikey: "apikey";
        }>;
    }, z.core.$strip>>;
    contact: z.ZodOptional<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        url: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    generatedAt: z.ZodString;
}, z.core.$strip>;
export type Tool = z.infer<typeof ToolSchema>;
export type Resource = z.infer<typeof ResourceSchema>;
export type McpDiscovery = z.infer<typeof McpDiscoverySchema>;
