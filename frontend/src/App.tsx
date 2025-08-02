import React from 'react'
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
        </Routes>
      </Content>
      <Footer />
    </Layout>
  )
}

export default App