import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration) {
      console.log('Service Worker registered:', r);
    },
    onRegisterError(error: Error) {
      console.log('Service Worker registration error:', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (offlineReady || needRefresh) {
    return (
      <div role="alert" className="fixed right-4 bottom-4 z-50 p-4 rounded-lg shadow-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            {offlineReady ? (
              <span>App ready to work offline</span>
            ) : (
              <span>New content available, click refresh button to update.</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {needRefresh && (
              <button onClick={() => updateServiceWorker(true)} className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors" aria-label="Reload"><RefreshCw className="h-5 w-5" /></button>
            )}
            <button onClick={() => close()} className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors" aria-label="Close"><X className="h-5 w-5" /></button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default ReloadPrompt;