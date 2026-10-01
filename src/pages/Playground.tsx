import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Workbench } from '../components/Workbench';
import { decodeRequest } from '../lib/share';
import { usePlayground } from '../store/playground';

export function PlaygroundPage() {
  const [params, setParams] = useSearchParams();
  const { loadRequest } = usePlayground();
  const shared = params.get('r');

  useEffect(() => {
    if (!shared) return;
    const req = decodeRequest(shared);
    if (req) loadRequest(req);
    setParams({}, { replace: true });
  }, [shared, loadRequest, setParams]);

  return <Workbench />;
}
