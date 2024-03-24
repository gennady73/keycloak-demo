import React from "react";

function logErrorToService(error, errorInfo) {
    // Send the error to a logging service (e.g., Sentry, Loggly)
    // Include additional information like errorInfo for better debugging
    // loggingService.logError(error, errorInfo);
    console.error('Logged error:', error, errorInfo);
}

class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { 
        hasError: false,
        error: null
     };
    }

    componentDidCatch(error, errorInfo) {
      logErrorToService(error, errorInfo);
      this.setState({ hasError: true, error: error });
    }
  
    render() {
      if (this.state.hasError) {
        return <div>Error: {this.state.error.message}</div>;
      }
      return this.props.children;
    }
  }


export default ErrorBoundary;