import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/lib/auth";

interface Exercise {
  id: number;
  title: string;
  description: string;
  time_minutes: number;
  points: number;
  icon: string;
  difficulty: string;
}

const Exercise = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/d0645bed-f351-4ea9-9d98-dded219384b0');
        const exercises = await response.json();
        const foundExercise = exercises.find((ex: Exercise) => ex.id === parseInt(id || '0'));
        
        if (foundExercise) {
          setExercise(foundExercise);
          setTotalTime(foundExercise.time_minutes * 60);
          setTimeLeft(foundExercise.time_minutes * 60);
        }
      } catch (error) {
        console.error('Error fetching exercise:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [id]);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleStart = () => {
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(totalTime);
  };

  const handleComplete = async () => {
    const user = getCurrentUser();
    if (!user) {
      toast({ title: "Ошибка", description: "Войдите в систему", variant: "destructive" });
      return;
    }

    if (!exercise) return;

    const timeSpent = Math.round((totalTime - timeLeft) / 60);

    try {
      const response = await fetch('https://functions.poehali.dev/d0645bed-f351-4ea9-9d98-dded219384b0', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          exercise_id: exercise.id,
          time_spent: timeSpent,
          score: 100
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        toast({
          title: "Упражнение завершено! 🎉",
          description: `Вы получили ${result.xp_earned} XP. Всего XP: ${result.total_xp}`
        });

        if (result.new_achievements && result.new_achievements.length > 0) {
          result.new_achievements.forEach((ach: any) => {
            toast({ title: `🏆 Достижение разблокировано!`, description: ach.name });
          });
        }

        setTimeout(() => navigate('/'), 2000);
      }
    } catch (error) {
      console.error('Error completing exercise:', error);
      toast({ title: "Ошибка", description: "Не удалось сохранить результат", variant: "destructive" });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-purple-50/30 to-orange-50/20">
        <div className="text-center">
          <Icon name="Loader" size={48} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка упражнения...</p>
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-purple-50/30 to-orange-50/20">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="font-heading">Упражнение не найдено</CardTitle>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-orange-50/20">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Назад
          </Button>
          <div className="flex items-center gap-3">
            <Badge variant="outline">{exercise.difficulty}</Badge>
            <Badge className="bg-secondary">+{exercise.points} XP</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
            <Icon name={exercise.icon} size={48} className="text-white" />
          </div>
          <h1 className="text-4xl font-heading font-bold mb-4">{exercise.title}</h1>
          <p className="text-lg text-muted-foreground">{exercise.description}</p>
        </div>

        <Card className="border-2 shadow-xl mb-8">
          <CardContent className="pt-8">
            <div className="text-center mb-6">
              <div className="text-7xl font-heading font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {formatTime(timeLeft)}
              </div>
              <Progress value={progressPercent} className="h-3 mt-4" />
            </div>

            <div className="flex gap-4 justify-center">
              {!isActive && timeLeft === totalTime && (
                <Button size="lg" onClick={handleStart} className="flex-1">
                  <Icon name="Play" size={24} className="mr-2" />
                  Начать
                </Button>
              )}

              {isActive && (
                <Button size="lg" onClick={handlePause} variant="outline" className="flex-1">
                  <Icon name="Pause" size={24} className="mr-2" />
                  Пауза
                </Button>
              )}

              {!isActive && timeLeft < totalTime && timeLeft > 0 && (
                <Button size="lg" onClick={handleStart} className="flex-1">
                  <Icon name="Play" size={24} className="mr-2" />
                  Продолжить
                </Button>
              )}

              {timeLeft < totalTime && (
                <Button size="lg" onClick={handleReset} variant="outline">
                  <Icon name="RotateCcw" size={24} className="mr-2" />
                  Сброс
                </Button>
              )}
            </div>

            {timeLeft === 0 && (
              <div className="mt-6 text-center">
                <p className="text-xl font-heading font-bold text-primary mb-4">
                  Время вышло! 🎨
                </p>
                <Button size="lg" onClick={handleComplete} className="w-full">
                  <Icon name="CheckCircle" size={24} className="mr-2" />
                  Завершить упражнение
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-50">
            <CardHeader>
              <Icon name="Target" size={28} className="text-primary mb-2" />
              <CardTitle className="font-heading">Цель упражнения</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Развивайте скорость и уверенность в рисовании. Не бойтесь делать ошибки — главное практика!
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-secondary/20 bg-gradient-to-br from-secondary/5 to-orange-50">
            <CardHeader>
              <Icon name="Lightbulb" size={28} className="text-secondary mb-2" />
              <CardTitle className="font-heading">Совет</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Сосредоточьтесь на основных формах и пропорциях. Детали можно добавить позже.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Exercise;
