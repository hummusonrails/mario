import { useState } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function Form() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    job_title: '',
    consent: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    // Require at least first and last name
    if (formData.name.trim().split(' ').length < 2) {
      alert("Please enter your first and last name.");
      return;
    }
    try {
      const response = await fetch(`${BACKEND_URL}/api/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create player record');
      }
      const data = await response.json();
      console.log('Player record created:', data);
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      alert('There was an error submitting the form. Please try again.');
    }
  };

  const styles = {
    container: {
      maxWidth: '100%',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column' as const,
      backgroundColor: '#f8f9fa',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    header: {
      backgroundColor: 'gray',
      color: 'white',
      padding: '1rem',
      textAlign: 'center' as const,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'sticky' as const,
      top: 0,
      zIndex: 100,
    },
    logo: {
      height: '40px',
      marginBottom: '0.5rem',
      display: 'block',
      margin: '0 auto',
    },
    headerTitle: {
      margin: '0',
      fontSize: '1.2rem',
      fontWeight: 'bold' as const,
    },
    main: {
      flex: 1,
      padding: '1.5rem 1rem',
      maxWidth: '500px',
      margin: '0 auto',
      width: '100%',
    },
    title: {
      fontSize: '1.8rem',
      fontWeight: 'bold' as const,
      marginBottom: '1.5rem',
      color: '#333',
      textAlign: 'center' as const,
    },
    formGroup: {
      marginBottom: '1.25rem',
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: '500',
      color: '#444',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      fontSize: '1rem',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: 'white',
      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
      transition: 'border-color 0.2s ease',
    },
    checkboxContainer: {
      display: 'flex',
      alignItems: 'flex-start',
      marginBottom: '1.5rem',
    },
    checkbox: {
      marginRight: '0.5rem',
      marginTop: '0.25rem',
      transform: 'scale(1.2)',
    },
    checkboxLabel: {
      fontSize: '0.9rem',
      lineHeight: '1.4',
      color: '#555',
    },
    button: {
      width: '100%',
      padding: '0.9rem',
      backgroundColor: '#EA5B0C',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1.1rem',
      fontWeight: 'bold' as const,
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    buttonHover: {
      backgroundColor: '#d24e0a',
    },
    successContainer: {
      textAlign: 'center' as const,
      padding: '2rem 1rem',
    },
    successTitle: {
      fontSize: '1.8rem',
      color: '#EA5B0C',
      marginBottom: '1rem',
    },
    successMessage: {
      fontSize: '1.1rem',
      lineHeight: '1.6',
      color: '#444',
    },
    footer: {
      backgroundColor: 'gray',
      color: 'white',
      padding: '1.5rem 1rem',
      textAlign: 'center' as const,
      fontSize: '0.9rem',
    },
    footerLinks: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1.5rem',
      marginBottom: '1rem',
    },
    footerLink: {
      color: 'white',
      textDecoration: 'none',
    },
    copyright: {
      color: '#aaa',
      fontSize: '0.8rem',
    }
  };

  if (submitted) {
    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <img src="./couchbase.svg" alt="Couchbase Logo" width={150} height={40} />
          <h1 style={styles.headerTitle}>Game Registration</h1>
        </header>
        
        <main style={styles.main}>
          <div style={styles.successContainer}>
            <h2 style={styles.successTitle}>Thanks for signing up!</h2>
            <p style={styles.successMessage}>You are now ready to play. Please come to the booth to give your best shot.</p>
            <img 
              src="./couchbase.svg?height=200&width=200" 
              alt="Success" 
              style={{ margin: '2rem auto', display: 'block' }} 
            />
          </div>
        </main>
        
        <footer style={styles.footer}>
          <div style={styles.footerLinks}>
            <a href="#" style={styles.footerLink}>Privacy Policy</a>
            <a href="#" style={styles.footerLink}>Terms of Use</a>
            <a href="#" style={styles.footerLink}>Contact</a>
          </div>
          <div style={styles.copyright}>
            © {new Date().getFullYear()} Couchbase. All rights reserved.
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <img 
          src="/couchbase.svg?height=40&width=150" 
          alt="Couchbase Logo" 
          style={styles.logo} 
        />
        <h1 style={styles.headerTitle}>Game Registration</h1>
      </header>
      
      <main style={styles.main}>
        <h1 style={styles.title}>Register to Play</h1>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your work email"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Phone Number:</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Company:</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Enter your company name"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Job Title:</label>
            <input
              type="text"
              name="job_title"
              value={formData.job_title}
              onChange={handleChange}
              placeholder="Enter your job title"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.checkboxContainer}>
            <input
              type="checkbox"
              name="consent"
              checked={formData.consent}
              onChange={handleChange}
              style={styles.checkbox}
              id="consent-checkbox"
            />
            <label htmlFor="consent-checkbox" style={styles.checkboxLabel}>
              I agree to receive communications from Couchbase about products, services, and events.
            </label>
          </div>
          <button 
            type="submit" 
            style={styles.button}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = styles.button.backgroundColor;
            }}
          >
            Start Your Adventure!
          </button>
        </form>
      </main>
      
      <footer style={styles.footer}>
        <div style={styles.footerLinks}>
          <a href="https://www.couchbase.com/privacy-policy/" style={styles.footerLink}>Privacy Policy</a>
          <a href="https://www.couchbase.com/terms-of-use/" style={styles.footerLink}>Terms of Use</a>
          <a href="https://www.couchbase.com/contact/" style={styles.footerLink}>Contact</a>
        </div>
        <div style={styles.copyright}>
          © {new Date().getFullYear()} Couchbase. All rights reserved.
        </div>
      </footer>
    </div>
  );
}