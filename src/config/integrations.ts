import { z } from "zod"

const GiscusMappingSchema = z.enum(["pathname", "url", "title", "og:title", "specific", "number"])

const GiscusSchema = z.object({
  category: z.string().trim().min(1),
  categoryId: z.string().regex(/^[A-Za-z0-9_-]+$/),
  mapping: GiscusMappingSchema,
  repo: z.string().regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/),
  repoId: z.string().regex(/^[A-Za-z0-9_-]+$/),
})

const Ga4Schema = z.object({
  measurementId: z.string().regex(/^G-[A-Z0-9]+$/),
})

const GISCUS_CATEGORY_ENV = "NEXT_PUBLIC_GISCUS_CATEGORY"
const GISCUS_CATEGORY_ID_ENV = "NEXT_PUBLIC_GISCUS_CATEGORY_ID"
const GISCUS_MAPPING_ENV = "NEXT_PUBLIC_GISCUS_MAPPING"
const GISCUS_REPO_ENV = "NEXT_PUBLIC_GISCUS_REPO"
const GISCUS_REPO_ID_ENV = "NEXT_PUBLIC_GISCUS_REPO_ID"
const GA_MEASUREMENT_ID_ENV = "NEXT_PUBLIC_GA_MEASUREMENT_ID"

export type IntegrationEnv = Readonly<Record<string, string | undefined>>

export type GiscusConfig =
  | Readonly<{
      enabled: false
    }>
  | Readonly<{
      category: string
      categoryId: string
      enabled: true
      mapping: z.infer<typeof GiscusMappingSchema>
      repo: string
      repoId: string
    }>

export type Ga4Config =
  | Readonly<{
      enabled: false
    }>
  | Readonly<{
      enabled: true
      measurementId: string
    }>

export type PublicIntegrations = Readonly<{
  ga4: Ga4Config
  giscus: GiscusConfig
}>

export class PublicIntegrationConfigError extends Error {
  constructor(cause: z.ZodError) {
    super(`Invalid public integration config: ${z.prettifyError(cause)}`)
    this.name = "PublicIntegrationConfigError"
    this.cause = cause
  }
}

export function getPublicIntegrations(env: IntegrationEnv = process.env): PublicIntegrations {
  return {
    ga4: parseGa4Config(env),
    giscus: parseGiscusConfig(env),
  }
}

function parseGiscusConfig(env: IntegrationEnv): GiscusConfig {
  const values = {
    category: normalizedEnvValue(env[GISCUS_CATEGORY_ENV]),
    categoryId: normalizedEnvValue(env[GISCUS_CATEGORY_ID_ENV]),
    mapping: normalizedEnvValue(env[GISCUS_MAPPING_ENV]),
    repo: normalizedEnvValue(env[GISCUS_REPO_ENV]),
    repoId: normalizedEnvValue(env[GISCUS_REPO_ID_ENV]),
  }

  const configuredValues = Object.values(values)

  if (configuredValues.every((value) => value === undefined)) {
    return { enabled: false }
  }

  const parsed = GiscusSchema.safeParse(values)

  if (!parsed.success) {
    throw new PublicIntegrationConfigError(parsed.error)
  }

  return {
    ...parsed.data,
    enabled: true,
  }
}

function parseGa4Config(env: IntegrationEnv): Ga4Config {
  const measurementId = normalizedEnvValue(env[GA_MEASUREMENT_ID_ENV])

  if (measurementId === undefined) {
    return { enabled: false }
  }

  const parsed = Ga4Schema.safeParse({ measurementId })

  if (!parsed.success) {
    throw new PublicIntegrationConfigError(parsed.error)
  }

  return {
    enabled: true,
    measurementId: parsed.data.measurementId,
  }
}

function normalizedEnvValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim()

  return trimmed && trimmed.length > 0 ? trimmed : undefined
}
