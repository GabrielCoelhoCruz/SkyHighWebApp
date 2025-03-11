import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Admin from './components/Admin';
import History from './components/History';
import Profile from './components/Profile';
import ResetPassword from './components/ResetPassword';
import EmailVerification from './components/EmailVerification';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';
// Import Tailwind styles
import './styles/index.css';

// Componente de depuração para ajudar a resolver problemas de login
const DebugAuthPage = () => {
  const [authState, setAuthState] = useState({
    currentUser: null,
    userDoc: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar usuário atual
        const currentUser = auth.currentUser;
        setAuthState(prev => ({ ...prev, currentUser }));
        
        if (currentUser) {
          // Verificar documento no Firestore
          try {
            const userRef = doc(db, "users", currentUser.uid);
            const userDoc = await getDoc(userRef);
            setAuthState(prev => ({ 
              ...prev, 
              userDoc: userDoc.exists() ? userDoc.data() : null 
            }));
          } catch (err) {
            setAuthState(prev => ({ 
              ...prev, 
              error: `Erro ao buscar documento: ${err.message}`
            }));
          }
        }
      } catch (err) {
        setAuthState(prev => ({ 
          ...prev, 
          error: `Erro geral: ${err.message}`
        }));
      } finally {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };
    
    checkAuth();
  }, []);
  
  const handleCreateUserDoc = async () => {
    if (!authState.currentUser) return;
    
    try {
      const userRef = doc(db, "users", authState.currentUser.uid);
      await setDoc(userRef, {
        uid: authState.currentUser.uid,
        email: authState.currentUser.email,
        emailVerified: authState.currentUser.emailVerified,
        nome: authState.currentUser.displayName || `Usuário ${authState.currentUser.uid.substr(0, 5)}`,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        status: 'ativo',
        role: 'user',
        equipe: '',
        equipeCross: ''
      });
      
      // Atualizar o estado para mostrar o novo documento
      const userDoc = await getDoc(userRef);
      setAuthState(prev => ({ 
        ...prev, 
        userDoc: userDoc.exists() ? userDoc.data() : null 
      }));
    } catch (err) {
      setAuthState(prev => ({ 
        ...prev, 
        error: `Erro ao criar documento: ${err.message}`
      }));
    }
  };
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Depuração de Autenticação</h1>
      
      <h2>Firebase Auth</h2>
      {authState.loading ? (
        <p>Carregando...</p>
      ) : authState.currentUser ? (
        <div>
          <p>✅ Usuário autenticado</p>
          <ul>
            <li>UID: {authState.currentUser.uid}</li>
            <li>Email: {authState.currentUser.email}</li>
            <li>Email Verificado: {authState.currentUser.emailVerified ? 'Sim' : 'Não'}</li>
            <li>Nome: {authState.currentUser.displayName || 'N/A'}</li>
          </ul>
        </div>
      ) : (
        <p>❌ Nenhum usuário autenticado</p>
      )}
      
      <h2>Firestore</h2>
      {authState.currentUser ? (
        authState.userDoc ? (
          <div>
            <p>✅ Documento do usuário encontrado</p>
            <pre>{JSON.stringify(authState.userDoc, null, 2)}</pre>
          </div>
        ) : (
          <div>
            <p>❌ Documento do usuário não encontrado</p>
            <button 
              style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              onClick={handleCreateUserDoc}
            >
              Criar Documento
            </button>
          </div>
        )
      ) : (
        <p>Faça login primeiro para verificar o documento</p>
      )}
      
      {authState.error && (
        <div style={{ color: 'red', marginTop: '20px' }}>
          <h2>Erro</h2>
          <p>{authState.error}</p>
        </div>
      )}
      
      <div style={{ marginTop: '30px' }}>
        <a href="/login" style={{ marginRight: '15px' }}>Ir para Login</a>
        <a href="/home">Ir para Home</a>
      </div>
    </div>
  );
};

function App() {
  const [userInitialized, setUserInitialized] = useState(false);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("App.js: Auth state changed", user ? `User ${user.uid} logged in` : "No user logged in");
      
      if (user) {
        // Se o usuário existe, atualizar no Firestore
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            console.log("App.js: Documento do usuário encontrado, atualizando");
            // Atualizar dados do usuário existente
            await updateDoc(userRef, {
              emailVerified: user.emailVerified,
              lastLogin: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          } else {
            console.log("App.js: Documento do usuário NÃO encontrado, criando...");
            // Criar novo documento se não existir
            await setDoc(userRef, {
              uid: user.uid,
              email: user.email,
              emailVerified: user.emailVerified,
              nome: user.displayName || '',
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
              status: 'ativo',
              role: 'user',
              equipe: '',
              equipeCross: ''
            });
          }
        } catch (error) {
          console.error("App.js: Erro ao atualizar informações do usuário:", error);
        }
      }
      
      setUserInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  if (!userInitialized) {
    return <div>Carregando aplicação...</div>;
  }

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/historico" element={<History />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="/debug-auth" element={<DebugAuthPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
