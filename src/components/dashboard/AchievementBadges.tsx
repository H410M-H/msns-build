import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Award, Trophy, Star, Zap, BookOpen, Target } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedDate: Date;
  points?: number;
}

interface Certificate {
  id: string;
  title: string;
  subject: string;
  dateEarned: Date;
  percentage: number;
  downloadUrl?: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  achieved: boolean;
  progress: number;
  target: number;
}

interface AchievementBadgesProps {
  badges?: Achievement[];
  certificates?: Certificate[];
  milestones?: Milestone[];
}

const iconMap: Record<string, React.ReactNode> = {
  excellence: <Trophy className="h-6 w-6" />,
  distinction: <Star className="h-6 w-6" />,
  streak: <Zap className="h-6 w-6" />,
  subject_mastery: <BookOpen className="h-6 w-6" />,
  improvement: <Target className="h-6 w-6" />,
  default: <Award className="h-6 w-6" />,
};

export function AchievementBadges({
  badges = [],
  certificates = [],
  milestones = [],
}: AchievementBadgesProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievements & Milestones</CardTitle>
        <CardDescription>Track your progress and earned badges</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="badges" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="badges">Badges ({badges.length})</TabsTrigger>
            <TabsTrigger value="certificates">Certificates ({certificates.length})</TabsTrigger>
            <TabsTrigger value="milestones">Milestones ({milestones.length})</TabsTrigger>
          </TabsList>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-4">
            {badges.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <Award className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No badges earned yet. Keep working hard!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    onClick={() => setSelectedAchievement(badge)}
                    className="cursor-pointer text-center p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition"
                  >
                    <div className="text-3xl mb-2">
                      {iconMap[badge.icon] || iconMap.default}
                    </div>
                    <p className="font-semibold text-sm">{badge.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(badge.earnedDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="space-y-4">
            {certificates.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <Trophy className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No certificates earned yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    onClick={() => setSelectedCertificate(cert)}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div>
                      <p className="font-semibold">{cert.title}</p>
                      <p className="text-sm text-gray-600">{cert.subject}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Earned on {new Date(cert.dateEarned).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{cert.percentage}%</Badge>
                      {cert.downloadUrl && (
                        <button className="text-blue-600 text-sm hover:underline ml-4">
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Milestones Tab */}
          <TabsContent value="milestones" className="space-y-4">
            {milestones.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <Target className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No milestones yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {milestones.map((milestone) => (
                  <div key={milestone.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">{milestone.title}</p>
                      <span className="text-xs text-gray-500">
                        {milestone.progress}/{milestone.target}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${(milestone.progress / milestone.target) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-600">{milestone.description}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Achievement Details Dialog */}
      <Dialog open={!!selectedAchievement} onOpenChange={() => setSelectedAchievement(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedAchievement?.title}</DialogTitle>
            <DialogDescription>{selectedAchievement?.description}</DialogDescription>
          </DialogHeader>
          {selectedAchievement?.points && (
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600">
                +{selectedAchievement.points} points
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
