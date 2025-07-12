
import './App.css'
import Login from './Pages/Login.jsx'
import SideBar from './Components/SideBar.jsx'
import TopBar from './Components/TopBar.jsx'
import Layout from './Components/Layout.jsx'
import { Routes, Route } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { useContext } from 'react'
import { LanguageContext } from './Components/Context/LanguageContext'
import DashBoard from './Pages/DashBoard.jsx'
import Quotations from './Pages/Quotations.jsx'
import SalesOrders from './Pages/SalesOrders.jsx'
import Settings from './Pages/Settings.jsx'
import Products from './Pages/Products.jsx'
import Invoices from './Pages/Invoices.jsx'
import Contacts from './Pages/Contacts.jsx'
import Reports from './Pages/Reports.jsx'

function App() {
 const { language } = useContext(LanguageContext);
  return (
    <>
     <div dir={language === 'ar' ? 'rtl' : 'ltr'}> 
      <Routes>
      
              <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={ <Layout><Login /> </Layout>} />
      <Route path="/dashboard" element={<Layout><DashBoard/></Layout>} />
      <Route path="/reports" element={<Layout><Reports/></Layout>} />
      <Route path="/settings" element={<Layout><Settings/> </Layout>} />
      <Route path="/sales-order" element={<Layout><SalesOrders/> </Layout>} />
      <Route path="/products" element={<Layout><Products/></Layout>} />
      <Route path="/contacts" element={<Layout><Contacts/></Layout>} />
      <Route path="/quotations" element={<Layout><Quotations/></Layout>} />
      <Route path="/invoices" element={<Layout><Invoices/></Layout>} />

</Routes>
     </div>

        
    </>
  )
}

export default App
