import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ConceptsPage } from './pages/Concepts';
import { GalleryPage } from './pages/Gallery';
import { HomePage } from './pages/Home';
import { LearnPage } from './pages/Learn';
import { LessonPage } from './pages/Lesson';
import { PlaygroundPage } from './pages/Playground';
import { PlaygroundProvider } from './store/playground';

export function App() {
  return (
    <PlaygroundProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="learn" element={<LearnPage />} />
            <Route path="learn/:lessonId/:step?" element={<LessonPage />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="playground" element={<PlaygroundPage />} />
            <Route path="concepts" element={<ConceptsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </PlaygroundProvider>
  );
}
