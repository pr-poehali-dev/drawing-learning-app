import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Icon from "@/components/ui/icon";

interface Lesson {
  id: number;
  title: string;
  description: string;
  content: string;
  duration: number;
  difficulty: string;
  icon: string;
  order_index: number;
}

const Lesson = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const response = await fetch(`https://functions.poehali.dev/93feccd4-0642-4834-8aef-d137b6476758?id=${id}`);
        const data = await response.json();
        setLesson(data);
      } catch (error) {
        console.error('Error fetching lesson:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, (lesson?.duration || 15) * 600);

    return () => clearInterval(interval);
  }, [lesson]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-purple-50/30 to-orange-50/20">
        <div className="text-center">
          <Icon name="Loader" size={48} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка урока...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-purple-50/30 to-orange-50/20">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="font-heading">Урок не найден</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')}>
              <Icon name="ArrowLeft" size={18} className="mr-2" />
              Вернуться на главную
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const contentParagraphs = lesson.content.split('. ').filter(p => p.trim());

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-orange-50/20">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Назад к урокам
          </Button>
          <div className="flex items-center gap-3">
            <Badge variant="outline">{lesson.difficulty}</Badge>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Icon name="Clock" size={16} />
              {lesson.duration} мин
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Icon name={lesson.icon} size={32} className="text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-heading font-bold mb-2">{lesson.title}</h1>
              <p className="text-lg text-muted-foreground">{lesson.description}</p>
            </div>
          </div>

          <Card className="border-2 mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Прогресс урока</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Icon name="BookOpen" size={24} className="text-primary" />
              Содержание урока
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {contentParagraphs.map((paragraph, index) => (
              <div
                key={index}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {index + 1}
                  </div>
                  <p className="text-base leading-relaxed pt-1">{paragraph.trim()}.</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-50">
            <CardHeader>
              <Icon name="Lightbulb" size={28} className="text-primary mb-2" />
              <CardTitle className="font-heading">Совет профи</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Практикуйте каждый элемент отдельно перед тем, как собрать всё вместе.
                Повторение — ключ к мастерству!
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-secondary/20 bg-gradient-to-br from-secondary/5 to-orange-50">
            <CardHeader>
              <Icon name="Target" size={28} className="text-secondary mb-2" />
              <CardTitle className="font-heading">Упражнение</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Нарисуйте 5 вариантов используя техники из урока
              </p>
              <Button className="w-full" variant="outline">
                <Icon name="CheckCircle" size={18} className="mr-2" />
                Отметить выполненным
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <Button size="lg" className="flex-1" onClick={() => navigate('/')}>
            <Icon name="CheckCircle" size={20} className="mr-2" />
            Завершить урок
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/')}>
            <Icon name="Repeat" size={20} className="mr-2" />
            Начать заново
          </Button>
        </div>
      </main>

      <footer className="mt-16 border-t bg-white/80 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="font-heading">Продолжайте практиковаться каждый день! 🎨</p>
        </div>
      </footer>
    </div>
  );
};

export default Lesson;
