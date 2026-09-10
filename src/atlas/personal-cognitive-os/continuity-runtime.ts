import {
  NotionHttpContinuityRegistryProvider,
  resolveLiveContinuity,
  type ContinuityRegistryProvider,
  type LiveContinuityBindingInput,
  type LiveContinuityBindingResult,
} from './live-continuity-binding';

export type ContinuityRuntimeRequest = LiveContinuityBindingInput;

export type ContinuityRuntimeResponse = LiveContinuityBindingResult & {
  runtime: 'ATLAS_CONTINUITY_RUNTIME_V1';
};

export type ContinuityRuntimeOptions = {
  provider?: ContinuityRegistryProvider;
  notionToken?: string;
  notionDataSourceId?: string;
  fetchImpl?: typeof fetch;
};

function providerFromOptions(options: ContinuityRuntimeOptions): ContinuityRegistryProvider {
  if (options.provider) return options.provider;

  const token = options.notionToken ?? process.env.NOTION_API_KEY ?? '';
  const dataSourceId = options.notionDataSourceId ?? process.env.ATLAS_CONTINUITY_DATA_SOURCE_ID ?? '';

  if (!token.trim()) throw new Error('atlas_continuity_runtime_missing_NOTION_API_KEY');
  if (!dataSourceId.trim()) throw new Error('atlas_continuity_runtime_missing_ATLAS_CONTINUITY_DATA_SOURCE_ID');

  return new NotionHttpContinuityRegistryProvider({
    token,
    dataSourceId,
    fetchImpl: options.fetchImpl,
  });
}

/**
 * Smallest executable boundary for Atlas continuity.
 *
 * The caller supplies only LOCAL conversation evidence. The runtime itself
 * reads the persistent registry before deciding what `Sigue` means.
 */
export async function handleContinuityRequest(
  request: ContinuityRuntimeRequest,
  options: ContinuityRuntimeOptions = {},
): Promise<ContinuityRuntimeResponse> {
  const provider = providerFromOptions(options);
  const result = await resolveLiveContinuity(request, provider);
  return {
    ...result,
    runtime: 'ATLAS_CONTINUITY_RUNTIME_V1',
  };
}
