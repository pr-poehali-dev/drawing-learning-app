import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Icon from "@/components/ui/icon";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Index = () => {
  const [completedLessons, setCompletedLessons] = useState(2);
  const totalLessons = 12;
  const progressPercent = (completedLessons / totalLessons) * 100;

  const lessons = [
    {
      id: 1,
      title: "Основы пропорций лица",
      description: "Научитесь правильно размещать черты лица",
      duration: "15 мин",
      difficulty: "Начальный",
      icon: "Ruler",
      completed: true
    },
    {
      id: 2,
      title: "Рисуем глаза",
      description: "Пошаговая инструкция по рисованию реалистичных глаз",
      duration: "25 мин",
      difficulty: "Средний",
      icon: "Eye",
      completed: true
    },
    {
      id: 3,
      title: "Техника рисования носа",
      description: "Изучаем анатомию и светотень носа",
      duration: "20 мин",
      difficulty: "Средний",
      icon: "Wind",
      completed: false
    },
    {
      id: 4,
      title: "Губы и рот",
      description: "Создаём объём и выразительность",
      duration: "30 мин",
      difficulty: "Средний",
      icon: "Smile",
      completed: false
    }
  ];

  const exercises = [
    {
      id: 1,
      title: "Быстрый скетч портрета",
      time: "5 мин",
      points: 50,
      icon: "Timer"
    },
    {
      id: 2,
      title: "Практика пропорций",
      time: "10 мин",
      points: 100,
      icon: "Target"
    },
    {
      id: 3,
      title: "Светотень",
      time: "15 мин",
      points: 150,
      icon: "Sun"
    }
  ];

  const gallery = [
    { id: 1, author: "Анна М.", likes: 234, comments: 12, level: "Новичок" },
    { id: 2, author: "Иван К.", likes: 189, comments: 8, level: "Продвинутый" },
    { id: 3, author: "Мария С.", likes: 312, comments: 24, level: "Средний" },
    { id: 4, author: "Алексей П.", likes: 156, comments: 7, level: "Новичок" }
  ];

  const achievements = [
    { id: 1, name: "Первый урок", icon: "Award", unlocked: true },
    { id: 2, name: "Неделя практики", icon: "Calendar", unlocked: true },
    { id: 3, name: "Мастер глаз", icon: "Eye", unlocked: false },
    { id: 4, name: "100 скетчей", icon: "Sparkles", unlocked: false }
  ];

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
                      <Button size="sm" variant={lesson.completed ? "outline" : "default"}>
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
                    <Button className="w-full">Начать упражнение</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {gallery.map((item, index) => (
                <Card
                  key={item.id}
                  className="hover:shadow-xl transition-all hover:-translate-y-1 animate-scale-in overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="aspect-square bg-gradient-to-br from-purple-100 via-orange-50 to-blue-100 flex items-center justify-center">
                    <Icon name="Image" size={48} className="text-muted-foreground/30" />
                  </div>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="w-8 h-8 bg-gradient-to-br from-primary to-secondary">
                        <AvatarFallback className="text-white text-xs">
                          {item.author.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.author}</p>
                        <Badge variant="secondary" className="text-xs">
                          {item.level}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icon name="Heart" size={16} />
                        {item.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="MessageCircle" size={16} />
                        {item.comments}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
              <Button className="w-full" variant="outline">
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
    </div>
  );
};

export default Index;
