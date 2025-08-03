// import React from 'react' // React 18+ with new JSX transform doesn't need explicit React import
import { Routes, Route } from 'react-router-dom'
import { Layout } from 'antd'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import FileConverter from './pages/FileConverter'
import ImageCompress from './pages/ImageCompress'
import ImageCrop from './pages/ImageCrop'
import ImageConvert from './pages/ImageConvert'
import ImageWatermark from './pages/ImageWatermark'
import Login from './pages/Login'
import UserCenter from './pages/UserCenter'

const { Content } = Layout

function App() {
  return (
    <Layout>
      <Header />
      <Content>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/file-converter" element={<FileConverter />} />
          <Route path="/image-compress" element={<ImageCompress />} />
          <Route path="/image-crop" element={<ImageCrop />} />
          <Route path="/image-convert" element={<ImageConvert />} />
          <Route path="/image-watermark" element={<ImageWatermark />} />
          <Route path="/login" element={<Login />} />
          <Route path="/user-center" element={<UserCenter />} />
        </Routes>
      </Content>
      <Footer />
    </Layout>
  )
}

export default App