import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import AuthDialog from "@/components/AuthDialog";
import { getCurrentUser, isAuthenticated } from "@/lib/auth";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(getCurrentUser());
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [completedLessons, setCompletedLessons] = useState(2);
  const [lessons, setLessons] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const totalLessons = 12;
  const progressPercent = (completedLessons / totalLessons) * 100;

  useEffect(() => {
    if (!isAuthenticated()) {
      setAuthDialogOpen(true);
    }

    fetch('https://functions.poehali.dev/93feccd4-0642-4834-8aef-d137b6476758')
      .then(res => res.json())
      .then(data => {
        const formattedLessons = data.map((lesson: any) => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          duration: `${lesson.duration} мин`,
          difficulty: lesson.difficulty,
          icon: lesson.icon,
          completed: false
        }));
        setLessons(formattedLessons);
      })
      .catch(err => console.error('Error loading lessons:', err));

    fetch('https://functions.poehali.dev/d0645bed-f351-4ea9-9d98-dded219384b0')
      .then(res => res.json())
      .then(data => {
        const formattedExercises = data.map((ex: any) => ({
          id: ex.id,
          title: ex.title,
          time: `${ex.time_minutes} мин`,
          points: ex.points,
          icon: ex.icon
        }));
        setExercises(formattedExercises);
      })
      .catch(err => console.error('Error loading exercises:', err));

    if (user) {
      fetch(`https://functions.poehali.dev/38a6e764-3373-4fa7-8067-5c764e8c0904?user_id=${user.id}&action=achievements`)
        .then(res => res.json())
        .then(data => {
          const formattedAch = data.map((a: any) => ({
            id: a.id,
            name: a.name,
            icon: a.icon,
            unlocked: a.unlocked
          }));
          setAchievements(formattedAch);
        })
        .catch(err => console.error('Error loading achievements:', err));
    }

    loadGallery();
  }, [user]);

  const loadGallery = () => {
    fetch('https://functions.poehali.dev/d1439467-0fbd-47d5-9496-bae1cd615868')
      .then(res => res.json())
      .then(data => setGallery(data))
      .catch(err => console.error('Error loading gallery:', err));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({ title: "Ошибка", description: "Выберите файл для загрузки", variant: "destructive" });
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = async () => {
        const base64 = reader.result?.toString().split(',')[1];
        
        const response = await fetch('https://functions.poehali.dev/d1439467-0fbd-47d5-9496-bae1cd615868', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user?.id || 1,
            title: uploadTitle || 'Без названия',
            description: uploadDescription,
            image: base64
          })
        });

        if (response.ok) {
          toast({ title: "Успех!", description: "Работа добавлена в галерею" });
          setUploadDialogOpen(false);
          setUploadTitle("");
          setUploadDescription("");
          setSelectedFile(null);
          loadGallery();
        } else {
          toast({ title: "Ошибка", description: "Не удалось загрузить изображение", variant: "destructive" });
        }
      };
    } catch (error) {
      toast({ title: "Ошибка", description: "Произошла ошибка при загрузке", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };







  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-orange-50/20">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Icon name="Palette" size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-heading font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              ArtLearn
            </h1>
          </div>
          <nav className="flex gap-6">
            <Button variant="ghost" className="font-heading">
              <Icon name="Home" size={18} className="mr-2" />
              Главная
            </Button>
            <Button variant="ghost" className="font-heading">
              <Icon name="BookOpen" size={18} className="mr-2" />
              Уроки
            </Button>
            <Button variant="ghost" className="font-heading">
              <Icon name="User" size={18} className="mr-2" />
              Профиль
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="mb-12 text-center animate-fade-in">
          <h2 className="text-5xl font-heading font-bold mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Научись рисовать от основ до мастерства
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Пошаговые уроки, интерактивные упражнения и поддержка сообщества художников
          </p>
        </section>

        <section className="mb-12">
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-heading text-2xl">Ваш прогресс</CardTitle>
                  <CardDescription>
                    {completedLessons} из {totalLessons} уроков завершено
                  </CardDescription>
                </div>
                <div className="text-4xl font-heading font-bold text-primary">
                  {Math.round(progressPercent)}%
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={progressPercent} className="h-3" />
              <div className="flex gap-4 mt-6">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      achievement.unlocked
                        ? "bg-primary/10 border-primary scale-105"
                        : "bg-muted/50 border-border opacity-50"
                    }`}
                  >
                    <Icon
                      name={achievement.icon}
                      size={32}
                      className={achievement.unlocked ? "text-primary" : "text-muted-foreground"}
                    />
                    <span className="text-xs font-medium text-center">{achievement.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <Tabs defaultValue="lessons" className="mb-12">
          <TabsList className="grid w-full grid-cols-3 h-14 p-1">
            <TabsTrigger value="lessons" className="font-heading text-base">
              <Icon name="GraduationCap" size={20} className="mr-2" />
              Уроки
            </TabsTrigger>
            <TabsTrigger value="exercises" className="font-heading text-base">
              <Icon name="Dumbbell" size={20} className="mr-2" />
              Упражнения
            </TabsTrigger>
            <TabsTrigger value="gallery" className="font-heading text-base">
              <Icon name="Images" size={20} className="mr-2" />
              Галерея
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lessons" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {lessons.map((lesson, index) => (
                <Card
                  key={lesson.id}
                  className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 cursor-pointer animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <Icon name={lesson.icon} size={28} className="text-white" />
                      </div>
                      {lesson.completed && (
                        <Badge className="bg-green-500">
                          <Icon name="CheckCircle" size={14} className="mr-1" />
                          Завершено
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="font-heading mt-4">{lesson.title}</CardTitle>
                    <CardDescription>{lesson.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Icon name="Clock" size={16} />
                          {lesson.duration}
                        </span>
                        <Badge variant="outline">{lesson.difficulty}</Badge>
                      </div>
                      <Button 
                        size="sm" 
                        variant={lesson.completed ? "outline" : "default"}
                        onClick={() => navigate(`/lesson/${lesson.id}`)}
                      >
                        {lesson.completed ? "Повторить" : "Начать"}
                        <Icon name="ArrowRight" size={16} className="ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="exercises" className="mt-6">
            <div className="grid md:grid-cols-3 gap-6">
              {exercises.map((exercise, index) => (
                <Card
                  key={exercise.id}
                  className="hover:shadow-lg transition-all hover:-translate-y-1 border-2 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="text-center">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center mb-4">
                      <Icon name={exercise.icon} size={36} className="text-white" />
                    </div>
                    <CardTitle className="font-heading">{exercise.title}</CardTitle>
                    <CardDescription className="text-2xl font-bold text-primary mt-2">
                      +{exercise.points} XP
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
                      <Icon name="Timer" size={18} />
                      <span>{exercise.time}</span>
                    </div>
                    <Button className="w-full" onClick={() => navigate(`/exercise/${exercise.id}`)}>
                      Начать упражнение
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="mt-6">
            <div className="mb-6 flex justify-end">
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Icon name="Upload" size={18} className="mr-2" />
                    Добавить работу
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-heading">Загрузить работу</DialogTitle>
                    <DialogDescription>
                      Поделитесь своим рисунком с сообществом
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Название</Label>
                      <Input
                        id="title"
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        placeholder="Название работы"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Описание</Label>
                      <Textarea
                        id="description"
                        value={uploadDescription}
                        onChange={(e) => setUploadDescription(e.target.value)}
                        placeholder="Расскажите о вашей работе"
                      />
                    </div>
                    <div>
                      <Label htmlFor="file">Изображение</Label>
                      <Input
                        id="file"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                      />
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={handleUpload}
                      disabled={uploading}
                    >
                      {uploading ? "Загрузка..." : "Загрузить"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {gallery.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Icon name="Image" size={48} className="text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">Галерея пока пуста. Добавьте первую работу!</p>
                </div>
              ) : (
                gallery.map((item, index) => (
                  <Card
                    key={item.id}
                    className="hover:shadow-xl transition-all hover:-translate-y-1 animate-scale-in overflow-hidden"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {item.image_url ? (
                      <div className="aspect-square overflow-hidden">
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="aspect-square bg-gradient-to-br from-purple-100 via-orange-50 to-blue-100 flex items-center justify-center">
                        <Icon name="Image" size={48} className="text-muted-foreground/30" />
                      </div>
                    )}
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-8 h-8 bg-gradient-to-br from-primary to-secondary">
                          <AvatarFallback className="text-white text-xs">
                            {item.author?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.author || 'Пользователь'}</p>
                          <Badge variant="secondary" className="text-xs">
                            {item.level || 'Новичок'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Icon name="Heart" size={16} />
                          {item.likes || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="MessageCircle" size={16} />
                          {item.comments || 0}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        <section className="grid md:grid-cols-3 gap-6">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-50">
            <CardHeader>
              <Icon name="Users" size={32} className="text-primary mb-2" />
              <CardTitle className="font-heading">Сообщество</CardTitle>
              <CardDescription>
                Делитесь работами и получайте обратную связь от других художников
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" onClick={() => setUploadDialogOpen(true)}>
                <Icon name="Upload" size={18} className="mr-2" />
                Поделиться работой
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-secondary/20 bg-gradient-to-br from-secondary/5 to-orange-50">
            <CardHeader>
              <Icon name="Lightbulb" size={32} className="text-secondary mb-2" />
              <CardTitle className="font-heading">Советы дня</CardTitle>
              <CardDescription>
                Рисуйте каждый день хотя бы по 15 минут — регулярность важнее длительности
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                <Icon name="RefreshCw" size={18} className="mr-2" />
                Другой совет
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-blue-50">
            <CardHeader>
              <Icon name="Trophy" size={32} className="text-accent mb-2" />
              <CardTitle className="font-heading">Челленджи</CardTitle>
              <CardDescription>
                Участвуйте в недельных челленджах и развивайте навыки
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                <Icon name="Zap" size={18} className="mr-2" />
                Текущий челлендж
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="mt-16 border-t bg-white/80 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="font-heading">Создано с ❤️ для художников</p>
        </div>
      </footer>

      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
        onSuccess={() => {
          setUser(getCurrentUser());
          setAuthDialogOpen(false);
        }}
      />
    </div>
  );
};

export default Index;