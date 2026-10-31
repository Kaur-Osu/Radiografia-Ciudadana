import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Home } from '@/pages/Home';
import { Explorer } from '@/pages/Explorer';
import { Comparator } from '@/pages/Comparator';
import { Profiles } from '@/pages/Profiles';
import { Methodology } from '@/pages/Methodology';
import { NotFound } from '@/pages/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path='explorador' element={<Explorer />} />
          <Route path='comparador' element={<Comparator />} />
          <Route path='perfiles' element={<Profiles />} />
          <Route path='metodologia' element={<Methodology />} />
        </Route>
        <Route path='*' element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
