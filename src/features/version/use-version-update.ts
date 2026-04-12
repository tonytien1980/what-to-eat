import { useEffect, useRef, useState } from 'react';
import { BUILD_ID } from './build-meta';

interface VersionManifest {
  buildId: string;
  builtAt?: string;
}

const VERSION_MANIFEST_URL = './version.json';

function normalizeManifest(value: unknown): VersionManifest | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<VersionManifest>;

  if (typeof candidate.buildId !== 'string' || candidate.buildId.length === 0) {
    return null;
  }

  return {
    buildId: candidate.buildId,
    builtAt: typeof candidate.builtAt === 'string' ? candidate.builtAt : undefined,
  };
}

async function fetchVersionManifest(fetcher: typeof fetch) {
  const response = await fetcher(`${VERSION_MANIFEST_URL}?t=${Date.now()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Version manifest request failed: ${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  return normalizeManifest(payload);
}

export function useVersionUpdate() {
  const [availableBuildId, setAvailableBuildId] = useState<string | null>(null);
  const checkingRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof fetch !== 'function') {
      return;
    }

    if (
      import.meta.env.MODE === 'test' &&
      !(globalThis as { __ENABLE_VERSION_CHECK_IN_TEST__?: boolean })
        .__ENABLE_VERSION_CHECK_IN_TEST__
    ) {
      return;
    }

    let isActive = true;

    async function checkForUpdate() {
      if (checkingRef.current) {
        return;
      }

      checkingRef.current = true;

      try {
        const manifest = await fetchVersionManifest(fetch);

        if (!isActive || !manifest) {
          return;
        }

        setAvailableBuildId(
          manifest.buildId !== BUILD_ID ? manifest.buildId : null,
        );
      } catch {
        if (isActive) {
          setAvailableBuildId((previous) => previous);
        }
      } finally {
        checkingRef.current = false;
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void checkForUpdate();
      }
    };

    const handleFocus = () => {
      void checkForUpdate();
    };

    void checkForUpdate();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      isActive = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  function reloadToLatestVersion() {
    if (typeof window === 'undefined') {
      return;
    }

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('v', availableBuildId ?? `${Date.now()}`);
    window.location.assign(nextUrl.toString());
  }

  return {
    hasUpdate: availableBuildId !== null,
    reloadToLatestVersion,
  };
}
