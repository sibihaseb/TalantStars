import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, ShieldCheck, Crown, Sparkles, ChevronLeft, ChevronRight, Eye, Users, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';

interface FeaturedTalent {
  id: string;
  username: string;
  profileImage: string;
  fullName: string;
  talentType: string;
  location: string;
  verificationStatus: string;
  featuredReason: string;
  skills: string[];
  bio: string;
  rating: number;
  category: string;
}

export default function FeaturedTalentsRotation() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const { data: featuredTalents = [], isLoading } = useQuery<FeaturedTalent[]>({
    queryKey: ['/api/featured-talents'],
  });

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (featuredTalents.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % featuredTalents.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [featuredTalents.length]);

  const nextTalent = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredTalents.length);
  };

  const prevTalent = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredTalents.length) % featuredTalents.length);
  };

  if (isLoading || featuredTalents.length === 0) {
    return (
      <div className="bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-purple-300">Loading featured talents...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentTalent = featuredTalents[currentIndex];

  return (
    <div className="bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 py-16 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Crown className="h-8 w-8 text-yellow-400 mr-3" />
            <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Featured Talents
            </h2>
            <Crown className="h-8 w-8 text-yellow-400 ml-3" />
          </div>
          <p className="text-purple-200 text-lg max-w-2xl mx-auto">
            Discover exceptional artists handpicked by our industry experts
          </p>
        </div>

        {/* Talent Showcase */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
            >
              {/* Talent Image */}
              <div className="relative group">
                <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 via-transparent to-transparent z-10"></div>
                  {currentTalent.profileImage ? (
                    <img
                      src={currentTalent.profileImage}
                      alt={currentTalent.fullName}
                      className="w-full h-96 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-96 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Avatar className="w-48 h-48 border-4 border-white/30">
                        <AvatarFallback className="bg-white/20 text-white text-6xl font-bold">
                          {currentTalent.fullName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-4 right-4 z-20">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-0 shadow-lg mb-2">
                      <Crown className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                    {currentTalent.verificationStatus === 'verified' && (
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-lg block">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Talent Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">{currentTalent.fullName}</h3>
                  <div className="flex items-center gap-4 text-purple-300 mb-4">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                      {currentTalent.talentType}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{currentTalent.location}</span>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-bold">{currentTalent.rating}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-purple-200 text-lg leading-relaxed">{currentTalent.bio}</p>
                
                <div className="flex flex-wrap gap-2">
                  {currentTalent.skills.slice(0, 4).map(skill => (
                    <Badge key={skill} variant="outline" className="border-purple-400 text-purple-300">
                      {skill}
                    </Badge>
                  ))}
                  {currentTalent.skills.length > 4 && (
                    <Badge variant="outline" className="border-purple-400 text-purple-300">
                      +{currentTalent.skills.length - 4} more
                    </Badge>
                  )}
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 text-yellow-400 font-medium">
                    <Sparkles className="h-4 w-4" />
                    <span>Featured for: {currentTalent.featuredReason}</span>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                    asChild
                  >
                    <Link href={`/talent/${currentTalent.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Profile
                    </Link>
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-purple-400 text-purple-300 hover:bg-purple-500/20"
                    asChild
                  >
                    <Link href="/featured-talents">
                      <Crown className="h-4 w-4 mr-2" />
                      View All Featured
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Navigation Buttons */}
          <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between pointer-events-none">
            <Button
              variant="outline"
              size="icon"
              onClick={prevTalent}
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 pointer-events-auto"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextTalent}
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 pointer-events-auto"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Talent Indicators */}
        <div className="flex justify-center mt-8 gap-2">
          {featuredTalents.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-purple-400 scale-125' 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
        
        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Crown className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{featuredTalents.length}</div>
              <div className="text-purple-300">Featured Talents</div>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Trophy className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">98%</div>
              <div className="text-purple-300">Success Rate</div>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Users className="h-8 w-8 text-pink-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">50K+</div>
              <div className="text-purple-300">Industry Connections</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}