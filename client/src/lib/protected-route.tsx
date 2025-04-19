import { Route } from "wouter";

// Simplified route replacement (no longer using authentication)
export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  // Simply render the component directly since we don't need authentication
  return <Route path={path} component={Component} />;
}
