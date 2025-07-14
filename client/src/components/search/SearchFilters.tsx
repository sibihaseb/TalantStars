import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, X } from "lucide-react";

interface SearchFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  onAIMatch?: (query: string) => void;
}

export interface SearchFilters {
  query: string;
  talentType: string;
  location: string;
  availability: string;
  budgetRange: string;
  skills: string[];
}

export function SearchFilters({ onSearch, onAIMatch }: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    talentType: "all",
    location: "all",
    availability: "all",
    budgetRange: "all",
    skills: [],
  });

  const [aiSuggestions] = useState([
    "Broadway Experience",
    "Bilingual Artists",
    "Action Performers",
    "Studio Musicians",
    "Fashion Models",
    "Voice Over Artists",
  ]);

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSkillToggle = (skill: string) => {
    setFilters((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleAIMatch = () => {
    if (onAIMatch) {
      onAIMatch(filters.query);
    }
  };

  return (
    <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Search className="h-5 w-5 text-blue-600" />
          <span>Find Talent</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search talent..."
              value={filters.query}
              onChange={(e) => handleFilterChange("query", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* AI Match Button */}
        <Button
          onClick={handleAIMatch}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          size="sm"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          AI Match
        </Button>

        {/* Filters */}
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Category</Label>
            <Select
              value={filters.talentType}
              onValueChange={(value) => handleFilterChange("talentType", value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="actor">Actors</SelectItem>
                <SelectItem value="musician">Musicians</SelectItem>
                <SelectItem value="model">Models</SelectItem>
                <SelectItem value="voice_artist">Voice Artists</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Location</Label>
            <Select
              value={filters.location}
              onValueChange={(value) => handleFilterChange("location", value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="Los Angeles, CA">Los Angeles, CA</SelectItem>
                <SelectItem value="New York, NY">New York, NY</SelectItem>
                <SelectItem value="Atlanta, GA">Atlanta, GA</SelectItem>
                <SelectItem value="Chicago, IL">Chicago, IL</SelectItem>
                <SelectItem value="Nashville, TN">Nashville, TN</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Availability</Label>
            <Select
              value={filters.availability}
              onValueChange={(value) => handleFilterChange("availability", value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Any Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Availability</SelectItem>
                <SelectItem value="available">Available Now</SelectItem>
                <SelectItem value="busy">Available Soon</SelectItem>
                <SelectItem value="unavailable">By Appointment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Budget Range</Label>
            <Select
              value={filters.budgetRange}
              onValueChange={(value) => handleFilterChange("budgetRange", value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Any Budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Budget</SelectItem>
                <SelectItem value="0-500">$0 - $500</SelectItem>
                <SelectItem value="500-2000">$500 - $2000</SelectItem>
                <SelectItem value="2000-5000">$2000 - $5000</SelectItem>
                <SelectItem value="5000+">$5000+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <Label className="text-sm font-medium">Quick Filters</Label>
          </div>
          <div className="flex flex-wrap gap-2">
            {aiSuggestions.map((suggestion) => (
              <Badge
                key={suggestion}
                variant={filters.skills.includes(suggestion) ? "default" : "secondary"}
                className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors text-xs"
                onClick={() => handleSkillToggle(suggestion)}
              >
                {suggestion}
                {filters.skills.includes(suggestion) && (
                  <X className="h-3 w-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>
        </div>

        {/* Search Button */}
        <Button
          onClick={handleSearch}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="sm"
        >
          <Search className="h-4 w-4 mr-2" />
          Search Talents
        </Button>
      </CardContent>
    </Card>
  );
}
