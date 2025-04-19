import { Banknote, FileText, BarChart2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SummaryCardProps {
  title: string;
  value: string;
  icon: "money" | "document" | "chart" | "clock";
  trend?: string;
  trendType?: "positive" | "negative" | "warning" | "neutral";
}

export default function SummaryCard({
  title,
  value,
  icon,
  trend,
  trendType = "neutral"
}: SummaryCardProps) {
  // Icon renderer
  const renderIcon = () => {
    switch (icon) {
      case "money":
        return <Banknote className="h-5 w-5 text-primary" />;
      case "document":
        return <FileText className="h-5 w-5 text-primary" />;
      case "chart":
        return <BarChart2 className="h-5 w-5 text-success" />;
      case "clock":
        return <Clock className="h-5 w-5 text-warning" />;
      default:
        return <Banknote className="h-5 w-5 text-primary" />;
    }
  };

  // Trend type color
  const getTrendColor = () => {
    switch (trendType) {
      case "positive":
        return "text-success";
      case "negative":
        return "text-danger";
      case "warning":
        return "text-warning";
      default:
        return "text-gray-500";
    }
  };

  // Trend icon
  const getTrendIcon = () => {
    if (trendType === "positive") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      );
    } else if (trendType === "negative") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      );
    } else if (trendType === "warning") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    }
    return null;
  };

  return (
    <Card className="transition-transform duration-200 ease-in-out hover:transform hover:-translate-y-1 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <span className="p-2 bg-opacity-10 rounded-md bg-primary">
            {renderIcon()}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-text-dark">{value}</span>
          {trend && (
            <span className={`text-sm flex items-center mt-1 ${getTrendColor()}`}>
              {getTrendIcon()}
              {trend}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
