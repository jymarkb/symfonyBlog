import { Component, ReactNode } from "react";

import { ErrorPage } from "@/components/common/ErrorPage";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <ErrorPage code={500} />;
    }
    return this.props.children;
  }
}
