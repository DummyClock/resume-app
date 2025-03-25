import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import AppTheme from './shared-theme/AppTheme';
import AppAppBar from './components/AppAppBar';
import Hero from './components/Hero';
import LogoCollection from './components/LogoCollection';
import Highlights from './components/Highlights';
import Pricing from './components/Pricing';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useNavigate } from 'react-router-dom';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


export default function LandingPage(props) {
  let navigate = useNavigate();
  let online = navigator.onLine;
  const checkAuth = async () => {
    const res = await fetch(API_BASE_URL + '/', {
      method: 'GET',
      credentials: 'include',
    });
    const data = await res.json();

    if (res.ok && data.message) {
      navigate('/home'); 
      }
  }
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      {!online && (
        <div style={{
          backgroundColor: 'black', 
          color: 'white', 
        }}>
          Error: Page failed to load due to network issue.
        </div>
      )}
      <AppAppBar />
      <Hero />
      <div>
        <Divider />
      </div>
    </AppTheme>
  );
}
