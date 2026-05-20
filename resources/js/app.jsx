import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import AdminPanel from './pages/AdminPanel';
import SellerPanel from './pages/SellerPanel';
import ProfilePage from './pages/ProfilePage';
import ProductDetail from './pages/ProductDetail';
import Layout from './components/Layout';
import '../css/app.css';

const getHome = (role) => role === 'buyer' ? '/catalog' : '/dashboard';

const PrivateRoute = ({ children, adminOnly = false, sellerOnly = false, buyerOnly = false }) => {
    const token = localStorage.getItem('token');
    const user  = JSON.parse(localStorage.getItem('user') || 'null');

    if (!token) return <Navigate to="/login" replace />;
    if (adminOnly  && user?.role !== 'admin')                          return <Navigate to={getHome(user?.role)} replace />;
    if (sellerOnly && !['admin','seller'].includes(user?.role))        return <Navigate to={getHome(user?.role)} replace />;
    if (buyerOnly  && user?.role !== 'buyer')                          return <Navigate to={getHome(user?.role)} replace />;
    return children;
};

const PublicRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const user  = JSON.parse(localStorage.getItem('user') || 'null');
    if (token) return <Navigate to={getHome(user?.role)} replace />;
    return children;
};

createRoot(document.getElementById('app')).render(
    <BrowserRouter>
        <Routes>
            <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route element={<Layout />}>
                <Route path="/catalog"            element={<PrivateRoute buyerOnly><Catalog /></PrivateRoute>} />
                <Route path="/products/:id"      element={<PrivateRoute buyerOnly><ProductDetail /></PrivateRoute>} />
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/admin"     element={<PrivateRoute adminOnly><AdminPanel /></PrivateRoute>} />
                <Route path="/seller"    element={<PrivateRoute sellerOnly><SellerPanel /></PrivateRoute>} />
                <Route path="/profile"   element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            </Route>
            <Route path="*" element={
                (() => {
                    const user = JSON.parse(localStorage.getItem('user') || 'null');
                    const token = localStorage.getItem('token');
                    if (!token) return <Navigate to="/login" replace />;
                    return <Navigate to={getHome(user?.role)} replace />;
                })()
            } />
        </Routes>
    </BrowserRouter>
);
