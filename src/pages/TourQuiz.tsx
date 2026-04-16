import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Sparkles, MapPin, Clock, Users, Footprints, Sun, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { usePublishedTours } from "@/hooks/useTours";
import { 
  QuizProfile, 
  Tour, 
  TourRegion, 
  TourCategory, 
  TourWalkingLevel, 
  TourTimeType, 
  TourBestFor,
  scoreTour, 
  getMatchReasons,
  REGION_OPTIONS,
  CATEGORY_OPTIONS,
  WALKING_LEVEL_OPTIONS,
  TIME_TYPE_OPTIONS,
  BEST_FOR_OPTIONS,
} from "@/lib/toursTypes";
import { trackEvent } from "@/lib/tracking";

type QuizStep = 'time' | 'group' | 'vibe' | 'walking' | 'priority' | 'weather' | 'results';

const PRIORITY_OPTIONS = [
  { id: 'relaxation', label: 'Relaxation', description: 'Take it easy, no rush' },
  { id: 'instagram', label: 'Instagram Spots', description: 'Photo-worthy locations' },
  { id: 'authentic', label: 'Authentic Experience', description: 'Local culture and traditions' },
  { id: 'comfort', label: 'Maximum Comfort', description: 'Premium experience' },
] as const;

const WEATHER_OPTIONS = [
  { id: 'flexible', label: 'I am flexible', description: 'Any weather is fine' },
  { id: 'avoid_wind', label: 'Avoid windy spots', description: 'Prefer sheltered areas' },
  { id: 'avoid_rain', label: 'Rain-friendly options', description: 'Indoor activities available' },
  { id: 'prefer_cool', label: 'Prefer cooler areas', description: 'Mountains or shaded spots' },
] as const;

const TourQuiz = () => {
  const navigate = useNavigate();
  const { data: tours = [], isLoading } = usePublishedTours();
  
  const [step, setStep] = useState<QuizStep>('time');
  const [profile, setProfile] = useState<Partial<QuizProfile>>({});
  const [recommendedTours, setRecommendedTours] = useState<{ tour: Tour; score: number; reasons: string[] }[]>([]);

  const steps: QuizStep[] = ['time', 'group', 'vibe', 'walking', 'priority', 'weather', 'results'];
  const currentIndex = steps.indexOf(step);
  const progress = ((currentIndex) / (steps.length - 1)) * 100;

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < steps.length - 1) {
      setStep(steps[nextIndex]);
    } else {
      // Calculate results
      calculateResults();
    }
  };

  const handleBack = () => {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setStep(steps[prevIndex]);
    }
  };

  const calculateResults = () => {
    trackEvent('tour_quiz_complete');
    
    const fullProfile: QuizProfile = {
      time_available: profile.time_available || 'Half day',
      group_type: profile.group_type || 'Couples',
      vibe: profile.vibe || 'Beach',
      walking_level: profile.walking_level || 'Low',
      priority: profile.priority || 'relaxation',
      weather_preference: profile.weather_preference || 'flexible',
      preferred_region: profile.preferred_region,
    };

    // Score all tours
    const scored = tours.map(tour => ({
      tour,
      score: scoreTour(tour, fullProfile),
      reasons: getMatchReasons(tour, fullProfile),
    }));

    // Sort by score and take top 3
    scored.sort((a, b) => b.score - a.score);
    setRecommendedTours(scored.slice(0, 3));
    setStep('results');
    
    trackEvent('tour_quiz_result_view');
  };

  const canProceed = () => {
    switch (step) {
      case 'time': return !!profile.time_available;
      case 'group': return !!profile.group_type;
      case 'vibe': return !!profile.vibe;
      case 'walking': return !!profile.walking_level;
      case 'priority': return !!profile.priority;
      case 'weather': return !!profile.weather_preference;
      default: return false;
    }
  };

  const handleOptionSelect = (updateFn: () => void) => {
    updateFn();
    // Auto-advance after a short delay for visual feedback
    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex < steps.length - 1) {
        setStep(steps[nextIndex]);
      } else {
        calculateResults();
      }
    }, 300);
  };

  const OptionCard = ({ 
    selected, 
    onClick, 
    icon: Icon, 
    label, 
    description 
  }: { 
    selected: boolean; 
    onClick: () => void; 
    icon?: any; 
    label: string; 
    description?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
        selected 
          ? 'border-accent bg-accent/10 shadow-md scale-[1.02]' 
          : 'border-border hover:border-accent/50 active:scale-[0.98]'
      }`}
    >
      {Icon && <Icon className={`w-6 h-6 mb-2 ${selected ? 'text-accent' : 'text-muted-foreground'}`} />}
      <p className="font-medium">{label}</p>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </button>
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title="Find Your Perfect Tour | Tour Quiz"
        description="Answer a few questions and get personalized tour recommendations for your Crete adventure."
        canonicalUrl="https://livtours.gr/quiz"
      />

      <div className="min-h-screen bg-gradient-to-b from-muted/50 to-background">
        <div className="container max-w-2xl mx-auto px-4 py-12">
          {step !== 'results' && (
            <>
              {/* Progress */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Question {currentIndex + 1} of {steps.length - 1}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Quiz Content */}
              <div className="glass-card p-6 md:p-8 mb-6">
                {step === 'time' && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <Clock className="w-12 h-12 mx-auto mb-4 text-accent" />
                      <h2 className="text-2xl font-bold mb-2">How much time do you have?</h2>
                      <p className="text-muted-foreground">This helps us find the right tour duration</p>
                    </div>
                    <div className="grid gap-4">
                      {TIME_TYPE_OPTIONS.map(option => (
                        <OptionCard
                          key={option}
                          selected={profile.time_available === option}
                          onClick={() => handleOptionSelect(() => setProfile(p => ({ ...p, time_available: option })))}
                          label={option}
                          description={option === 'Half day' ? '4 to 5 hours' : '7 to 8 hours'}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {step === 'group' && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <Users className="w-12 h-12 mx-auto mb-4 text-accent" />
                      <h2 className="text-2xl font-bold mb-2">Who are you traveling with?</h2>
                      <p className="text-muted-foreground">We will tailor recommendations to your group</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {BEST_FOR_OPTIONS.map(option => (
                        <OptionCard
                          key={option}
                          selected={profile.group_type === option}
                          onClick={() => handleOptionSelect(() => setProfile(p => ({ ...p, group_type: option })))}
                          label={option}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {step === 'vibe' && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <Sparkles className="w-12 h-12 mx-auto mb-4 text-accent" />
                      <h2 className="text-2xl font-bold mb-2">What vibe are you looking for?</h2>
                      <p className="text-muted-foreground">Pick the experience that excites you most</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {CATEGORY_OPTIONS.map(option => (
                        <OptionCard
                          key={option}
                          selected={profile.vibe === option}
                          onClick={() => handleOptionSelect(() => setProfile(p => ({ ...p, vibe: option })))}
                          label={option}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {step === 'walking' && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <Footprints className="w-12 h-12 mx-auto mb-4 text-accent" />
                      <h2 className="text-2xl font-bold mb-2">How much walking is okay?</h2>
                      <p className="text-muted-foreground">Some tours involve more walking than others</p>
                    </div>
                    <div className="grid gap-4">
                      {WALKING_LEVEL_OPTIONS.map(option => (
                        <OptionCard
                          key={option}
                          selected={profile.walking_level === option}
                          onClick={() => handleOptionSelect(() => setProfile(p => ({ ...p, walking_level: option })))}
                          label={option === 'Low' ? 'Minimal walking' : 'Some walking is fine'}
                          description={option === 'Low' ? 'Mostly driving with short stops' : 'Happy to explore on foot'}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {step === 'priority' && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <MapPin className="w-12 h-12 mx-auto mb-4 text-accent" />
                      <h2 className="text-2xl font-bold mb-2">What matters most to you?</h2>
                      <p className="text-muted-foreground">This helps us pick the perfect tour</p>
                    </div>
                    <div className="grid gap-4">
                      {PRIORITY_OPTIONS.map(option => (
                        <OptionCard
                          key={option.id}
                          selected={profile.priority === option.id}
                          onClick={() => handleOptionSelect(() => setProfile(p => ({ ...p, priority: option.id })))}
                          label={option.label}
                          description={option.description}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {step === 'weather' && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <Sun className="w-12 h-12 mx-auto mb-4 text-accent" />
                      <h2 className="text-2xl font-bold mb-2">Any weather preferences?</h2>
                      <p className="text-muted-foreground">We can suggest weather-appropriate tours</p>
                    </div>
                    <div className="grid gap-4">
                      {WEATHER_OPTIONS.map(option => (
                        <OptionCard
                          key={option.id}
                          selected={profile.weather_preference === option.id}
                          onClick={() => handleOptionSelect(() => setProfile(p => ({ ...p, weather_preference: option.id })))}
                          label={option.label}
                          description={option.description}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex gap-4">
                {currentIndex > 0 && (
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}
                <Button 
                  variant="hero" 
                  onClick={handleNext} 
                  disabled={!canProceed()}
                  className="flex-1"
                >
                  {currentIndex === steps.length - 2 ? 'See Results' : 'Continue'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          )}

          {/* Results */}
          {step === 'results' && (
            <div className="space-y-8">
              <div className="text-center">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-accent" />
                <h1 className="text-3xl font-bold mb-2">Your Perfect Tours</h1>
                <p className="text-muted-foreground">Based on your preferences, here are our top recommendations</p>
              </div>

              {recommendedTours.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <p className="text-muted-foreground mb-4">No exact matches found, but check out all our tours!</p>
                  <Button onClick={() => navigate('/tours/browse')}>Browse All Tours</Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {recommendedTours.map(({ tour, score, reasons }, index) => (
                    <div key={tour.id} className="glass-card overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        {/* Image */}
                        <div className="md:w-1/3 aspect-video md:aspect-auto relative">
                          {tour.images.cover_url ? (
                            <img 
                              src={tour.images.cover_url} 
                              alt={tour.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                              <Sparkles className="w-12 h-12 text-accent/50" />
                            </div>
                          )}
                          <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
                            #{index + 1} Match
                          </Badge>
                        </div>

                        {/* Content */}
                        <div className="p-6 md:w-2/3">
                          <h3 className="text-xl font-bold mb-2">{tour.title}</h3>
                          
                          {tour.short_teaser && (
                            <p className="text-muted-foreground mb-4">{tour.short_teaser}</p>
                          )}

                          {/* Match Reasons */}
                          {reasons.length > 0 && (
                            <div className="mb-4">
                              <p className="text-sm font-medium text-accent mb-2">Why this matches you:</p>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {reasons.map((reason, i) => (
                                  <li key={i} className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                                    {reason}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Quick Info */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge variant="secondary">{tour.duration_hours}h</Badge>
                            <Badge variant="secondary">{tour.region}</Badge>
                            <Badge variant="outline">{tour.category}</Badge>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3">
                            <Button variant="outline" onClick={() => navigate(`/tours/${tour.slug}`)}>
                              View Details
                            </Button>
                            <Button 
                              variant="hero"
                              onClick={() => {
                                trackEvent('tour_quiz_book_click', { tourId: tour.id, tourTitle: tour.title });
                                const message = `Hi! Based on the quiz, I am interested in: ${tour.title}`;
                                window.open(`https://wa.me/306944363525?text=${encodeURIComponent(message)}`, '_blank');
                              }}
                            >
                              Book Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => { setStep('time'); setProfile({}); }}>
                  Retake Quiz
                </Button>
                <Button variant="ghost" onClick={() => navigate('/tours/browse')}>
                  Browse All Tours
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TourQuiz;
