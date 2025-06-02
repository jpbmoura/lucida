"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { DBExam, Question } from "@/types/exam";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function EditExamPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [exam, setExam] = useState<DBExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [editedExam, setEditedExam] = useState<DBExam | null>(null);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await axios.get(`/api/exam/${params.id}`);
        const examData = response.data.exam;
        setExam(examData);
        setEditedExam(examData);
      } catch (error) {
        console.error("Error fetching exam:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar a prova.",
        });
        router.push("/dashboard/exams");
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [params.id, router, toast]);

  const handleTitleChange = (value: string) => {
    if (editedExam) {
      setEditedExam({ ...editedExam, title: value });
    }
  };

  const handleDescriptionChange = (value: string) => {
    if (editedExam) {
      setEditedExam({ ...editedExam, description: value });
    }
  };

  const handleQuestionChange = (index: number, value: string) => {
    if (editedExam) {
      const updatedQuestions = [...editedExam.questions];
      updatedQuestions[index] = { ...updatedQuestions[index], question: value };
      setEditedExam({ ...editedExam, questions: updatedQuestions });
    }
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    if (editedExam) {
      const updatedQuestions = [...editedExam.questions];
      const updatedOptions = [...updatedQuestions[questionIndex].options || []];
      updatedOptions[optionIndex] = value;
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        options: updatedOptions,
      };
      setEditedExam({ ...editedExam, questions: updatedQuestions });
    }
  };

  const handleCorrectAnswerChange = (questionIndex: number, value: number | boolean) => {
    if (editedExam) {
      const updatedQuestions = [...editedExam.questions];
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        correctAnswer: value,
      };
      setEditedExam({ ...editedExam, questions: updatedQuestions });
    }
  };

  const handleSave = async () => {
    try {
      await axios.put(`/api/exam/${params.id}`, editedExam);
      toast({
        title: "Sucesso",
        description: "Prova atualizada com sucesso.",
      });
      router.push("/dashboard/exams");
    } catch (error) {
      console.error("Error updating exam:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar a prova.",
      });
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2">Carregando prova...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (!exam || !editedExam) {
    return null;
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Editar Prova"
        text="Modifique o conteúdo da sua prova."
      >
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/exams/${params.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>
      </DashboardHeader>

      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Título da Prova</label>
            <Input
              value={editedExam.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Descrição</label>
            <Textarea
              value={editedExam.description || ""}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Questões</h3>
          {editedExam.questions.map((question, questionIndex) => (
            <div key={questionIndex} className="space-y-4 p-4 border rounded-lg">
              <div>
                <label className="text-sm font-medium">
                  Questão {questionIndex + 1}
                </label>
                <Textarea
                  value={question.question}
                  onChange={(e) => handleQuestionChange(questionIndex, e.target.value)}
                  className="mt-1"
                />
              </div>

              {question.options ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Opções</label>
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`question-${questionIndex}`}
                        checked={question.correctAnswer === optionIndex}
                        onChange={() => handleCorrectAnswerChange(questionIndex, optionIndex)}
                        className="h-4 w-4"
                      />
                      <Input
                        value={option}
                        onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Resposta Correta</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`question-${questionIndex}`}
                        checked={question.correctAnswer === true}
                        onChange={() => handleCorrectAnswerChange(questionIndex, true)}
                        className="h-4 w-4"
                      />
                      Verdadeiro
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`question-${questionIndex}`}
                        checked={question.correctAnswer === false}
                        onChange={() => handleCorrectAnswerChange(questionIndex, false)}
                        className="h-4 w-4"
                      />
                      Falso
                    </label>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
} 