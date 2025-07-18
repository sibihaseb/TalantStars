import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Header } from '@/components/layout/Header';
import { 
  Star, 
  MapPin, 
  Search, 
  Filter,
  Heart,
  Share2,
  ShieldCheck,
  Crown,
  Sparkles,
  Camera,
  Music,
  Mic,
  Palette,
  Film,
  Eye,
  Zap,
  Trophy,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';

interface FeaturedTalent {
  id: number;
  name: string;
  type: string;
  location: string;
  rating: number;
  reviews: number;
  image: string;
  verified: boolean;
  available: boolean;
  specialty: string;
  role: string;
}

interface TalentCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  talentCount: number;
}

const getTalentIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'actor': return <Camera className="w-5 h-5" />;
    case 'musician': return <Music className="w-5 h-5" />;
    case 'voice_artist': return <Mic className="w-5 h-5" />;
    case 'model': return <Palette className="w-5 h-5" />;
    case 'director': return <Film className="w-5 h-5" />;
    default: return <Star className="w-5 h-5" />;
  }
};

export default function FeaturedTalents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTalentType, setSelectedTalentType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');

  const { data: featuredTalents = [], isLoading: talentsLoading, error } = useQuery<FeaturedTalent[]>({
    queryKey: ['/api/featured-talents'],
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<TalentCategory[]>({
    queryKey: ['/api/talent-categories'],
  });

  const filteredTalents = featuredTalents.filter(talent => {
    const matchesSearch = talent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         talent.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || talent.type === selectedCategory;
    const matchesType = selectedTalentType === 'all' || talent.type === selectedTalentType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const sortedTalents = filteredTalents.sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'reviews':
        return b.reviews - a.reviews;
      default:
        return 0;
    }
  });

  // Debug logging
  console.log('Featured talents query:', { featuredTalents, talentsLoading, error });
  console.log('Featured talents length:', featuredTalents?.length);
  console.log('Filtered talents length:', filteredTalents?.length);
  console.log('Sorted talents length:', sortedTalents?.length);

  if (talentsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-400 mx-auto mb-4"></div>
              <Sparkles className="h-8 w-8 text-purple-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-purple-300 text-lg font-medium">Discovering exceptional talents...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-8">
              <Crown className="h-16 w-16 text-yellow-400 mr-4" />
              <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-yellow-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Featured Talents
              </h1>
              <Crown className="h-16 w-16 text-yellow-400 ml-4" />
            </div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-purple-100 max-w-4xl mx-auto leading-relaxed"
            >
              Discover the extraordinary artists who are redefining entertainment excellence
            </motion.p>
            

          </motion.div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 mb-4 border border-white/20"
        >
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-purple-300" />
              <Input
                placeholder="Search extraordinary talents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 bg-white/20 border-white/30 text-white placeholder-purple-300 focus:border-purple-400"
              />
            </div>
            
            <div className="flex gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 bg-white/20 border-white/30 text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-white">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.name} className="text-white">
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedTalentType} onValueChange={setSelectedTalentType}>
                <SelectTrigger className="w-48 bg-white/20 border-white/30 text-white">
                  <SelectValue placeholder="Select talent type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-white">All Types</SelectItem>
                  <SelectItem value="actor" className="text-white">Actor</SelectItem>
                  <SelectItem value="musician" className="text-white">Musician</SelectItem>
                  <SelectItem value="voice_artist" className="text-white">Voice Artist</SelectItem>
                  <SelectItem value="model" className="text-white">Model</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-white/20 border-white/30 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="rating" className="text-white">Rating</SelectItem>
                  <SelectItem value="name" className="text-white">Name</SelectItem>
                  <SelectItem value="reviews" className="text-white">Reviews</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-4">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-1 border border-white/20">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-purple-200 transition-all duration-300"
              >
                All
              </TabsTrigger>
              {categories.map(category => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.name}
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-purple-200 transition-all duration-300"
                >
                  {category.icon} {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Talents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {sortedTalents.map((talent, index) => (
            <motion.div
              key={talent.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <Card className="bg-white/10 backdrop-blur-md border-0 shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105 overflow-hidden">
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 via-transparent to-transparent z-10"></div>
                  {talent.image ? (
                    <img
                      src={talent.image}
                      alt={talent.name}
                      className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-56 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Avatar className="w-32 h-32 border-4 border-white/30">
                        <AvatarFallback className="bg-white/20 text-white text-3xl font-bold">
                          {talent.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                  
                  {/* Verification Badge */}
                  {talent.verified && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 z-20">
                      <ShieldCheck className="h-3 w-3" />
                      Verified
                    </div>
                  )}
                  
                  {/* Featured Badge */}
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-20">
                    <Zap className="h-3 w-3" />
                    FEATURED
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                    <Button size="sm" className="flex-1 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
                      <Heart className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button size="sm" className="flex-1 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-white">{talent.name}</CardTitle>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-bold">{talent.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-purple-300">
                    <div className="flex items-center gap-1">
                      {getTalentIcon(talent.type)}
                      <span>{talent.type}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-purple-300">
                    <MapPin className="h-4 w-4" />
                    {talent.location}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-purple-200 line-clamp-2">{talent.specialty}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs border-purple-400 text-purple-300">
                        {talent.type}
                      </Badge>
                      {talent.available && (
                        <Badge variant="outline" className="text-xs border-green-400 text-green-300">
                          Available
                        </Badge>
                      )}
                    </div>
                    
                    <div className="pt-3 border-t border-purple-500/30">
                      <div className="flex items-center gap-2 text-xs text-yellow-400 font-medium">
                        <Crown className="h-3 w-3" />
                        {talent.reviews} reviews
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {sortedTalents.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-20"
          >
            <div className="text-purple-300 text-8xl mb-6">🎭</div>
            <h3 className="text-2xl font-bold text-white mb-4">No talents found</h3>
            <p className="text-purple-300 text-lg">Try adjusting your search or filters to discover more talents</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}