"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Edit, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import router from "next/router";
import { DBExam } from "@/types/exam";

interface ExamConfig {
  title: string;
  description: string;
  questionCount: number;
  questionTypes: {
    multipleChoice: boolean;
    trueFalse: boolean;
    shortAnswer: boolean;
    essay: boolean;
  };
  difficulty: string;
  timeLimit: number;
}

interface CreateExamPreviewProps {
  files: File[];
  config: ExamConfig;
  onBack: () => void;
  onSave?: (exam: any) => Promise<void>;
  existingExam?: DBExam;
}

export function CreateExamPreview({
  files,
  config,
  onBack,
  onSave,
  existingExam,
}: CreateExamPreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [examGenerated, setExamGenerated] = useState(!!existingExam);
  const [generatedExam, setGeneratedExam] = useState<any>(existingExam || null);
  const { toast } = useToast();

  const handleUploadFilesAndGenerateQuestions = async (files: File[]) => {
    try {
      setIsGenerating(true);
      const formData = new FormData();

      for (const file of files) {
        formData.append("file", file);
      }

      formData.append("config", JSON.stringify(config));

      const response = await axios("/api/upload", {
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = response.data;

      if (data.error) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: data.error,
        });
        return;
      }

      if (data.results) {
        const errors = data.results.filter((result: any) => result.error);
        if (errors.length > 0) {
          errors.forEach((error: any) => {
            toast({
              variant: "destructive",
              title: `Erro ao processar ${error.fileName}`,
              description: error.error,
            });
          });
        }
        const successfulResults = data.results.filter(
          (result: any) => result.questions
        );
        if (successfulResults.length > 0) {
          console.log("Questões geradas:", successfulResults);
        }
      }
      setIsGenerating(false);
      setExamGenerated(true);
      setGeneratedExam(data);
    } catch (error) {
      setIsGenerating(false);
      toast({
        variant: "destructive",
        title: "Erro",
        description:
          "Falha ao processar os arquivos. Por favor, tente novamente.",
      });
    }
  };

  const handleCreateExam = async () => {
    if (onSave && existingExam) {
      await onSave(generatedExam);
    } else {
      await axios("/api/exam", {
        method: "POST",
        data: generatedExam,
      });
      router.push("/dashboard/exams");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Visualização da Prova</CardTitle>
          <CardDescription>
            Revise a configuração da sua prova antes da geração.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Detalhes da Prova</h3>
              <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Título
                  </dt>
                  <dd className="mt-1">{config.title}</dd>
                </div>
                {config.description && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Descrição
                    </dt>
                    <dd className="mt-1">{config.description}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Tempo Limite
                  </dt>
                  <dd className="mt-1 flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    {config.timeLimit} minutos
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Dificuldade
                  </dt>
                  <dd className="mt-1 capitalize">
                    {config.difficulty === "easy" && "Fácil"}
                    {config.difficulty === "medium" && "Médio"}
                    {config.difficulty === "hard" && "Difícil"}
                    {config.difficulty === "mixed" && "Misto"}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-semibold">
                Configuração das Questões
              </h3>
              <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Total de Questões
                  </dt>
                  <dd className="mt-1">{config.questionCount}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Tipos de Questões
                  </dt>
                  <dd className="mt-1">
                    {Object.entries(config.questionTypes)
                      .filter(([_, enabled]) => enabled)
                      .map(([type]) => {
                        if (type === "multipleChoice")
                          return "Múltipla Escolha";
                        if (type === "trueFalse") return "Verdadeiro/Falso";
                        if (type === "shortAnswer") return "Resposta Curta";
                        if (type === "essay") return "Dissertativa";
                        return type;
                      })
                      .join(", ")}
                  </dd>
                </div>
              </dl>
            </div>

            {files.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold">Materiais de Origem</h3>
                <ul className="mt-2 space-y-1">
                  {files.map((file, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <FileText className="mr-2 h-4 w-4" />
                      {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Voltar para Personalização
          </Button>
          {examGenerated ? (
            <Button onClick={handleCreateExam}>
              {existingExam ? "Salvar Alterações" : "Ver Todas as Provas"}
            </Button>
          ) : (
            <Button
              onClick={() => handleUploadFilesAndGenerateQuestions(files)}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando Prova...
                </>
              ) : (
                "Gerar Prova"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>

      {examGenerated && generatedExam && (
        <Card>
          <CardHeader>
            <CardTitle>{generatedExam.title || generatedExam.config.title}</CardTitle>
            <CardDescription className="flex flex-col gap-1 ">
              <span>{generatedExam.description || generatedExam.config.description}</span>
              <div className="flex items-center gap-2">
                <span>{generatedExam.timeLimit || generatedExam.config.timeLimit} minutos</span>
                <span>
                  {generatedExam.difficulty === "easy" && "Fácil"}
                  {generatedExam.difficulty === "medium" && "Médio"}
                  {generatedExam.difficulty === "hard" && "Difícil"}
                  {generatedExam.difficulty === "mixed" && "Misto"}
                </span>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="exam">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="exam">Visualização da Prova</TabsTrigger>
                <TabsTrigger value="answers">Gabarito</TabsTrigger>
              </TabsList>
              <TabsContent value="exam" className="space-y-4 mt-4">
                <div className="rounded-md border p-4">
                  <div className="mt-6 space-y-6">
                    {generatedExam.questions.map((question: any, index: number) => (
                      <div key={index} className="space-y-2">
                        <h3 className="font-medium">
                          {index + 1}. {question.question}
                        </h3>
                        {question.options && (
                          <div className="ml-6 space-y-1">
                            {question.options.map((option: string, optionIndex: number) => (
                              <div
                                key={optionIndex}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="radio"
                                  name={`question-${index}`}
                                  className="h-4 w-4"
                                  disabled
                                />
                                <label>{option}</label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="answers" className="space-y-4 mt-4">
                <div className="rounded-md border p-4">
                  <h2 className="text-xl font-bold mb-4">
                    Gabarito: {generatedExam.title || generatedExam.config.title}
                  </h2>
                  <div className="mt-6 space-y-4">
                    {generatedExam.questions.map((question: any, index: number) => (
                      <div key={index} className="space-y-1">
                        <h3 className="font-medium">
                          {index + 1}. {question.question}
                        </h3>
                        <div className="ml-6">
                          <span className="text-sm font-medium">
                            Resposta:{" "}
                          </span>
                          <span>
                            {question.options
                              ? question.options[question.correctAnswer]
                              : question.correctAnswer
                              ? "Verdadeiro"
                              : "Falso"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
