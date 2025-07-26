"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Settings, ExternalLink, Loader2 } from "lucide-react";
import IntegratLogo from "@/assets/images/logos/integrat.png";
import Image from "next/image";
import React from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

interface Integration {
  _id?: string;
  name: string;
  isActive: boolean;
  apiKey: string;
}

interface UserData {
  user: any;
  integrations: Integration[];
}

// Available integrations that are always shown
const availableIntegrations = [
  {
    id: 1,
    name: "integrat",
    displayName: "Integrat",
    description:
      "Sincronize as notas de seus alunos com a secretaria digital Integrat",
    icon: IntegratLogo,
  },
];

function getStatusBadge(isActive: boolean) {
  return isActive ? (
    <Badge
      variant="default"
      className="bg-green-100 text-green-800 hover:bg-green-100"
    >
      Ativo
    </Badge>
  ) : (
    <Badge variant="secondary" className="bg-gray-100 text-gray-800">
      Inativo
    </Badge>
  );
}

export default function IntegrationsPage() {
  const [userData, setUserData] = React.useState<UserData>({
    user: null,
    integrations: [],
  });
  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState<string | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = React.useState(false);
  const [selectedIntegration, setSelectedIntegration] =
    React.useState<any>(null);
  const [configApiKey, setConfigApiKey] = React.useState("");
  const [configIsActive, setConfigIsActive] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const { toast } = useToast();

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/user");

      if (response.data.status === "success") {
        const data = response.data.data;
        setUserData({
          user: data.user,
          integrations: data.user.integrations || [],
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Falha ao carregar dados do usuário",
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao carregar dados do usuário",
      });
    } finally {
      setLoading(false);
    }
  };

  const openConfigDialog = (integration: any) => {
    const userIntegration = userData.integrations.find(
      (userInt) => userInt.name === integration.name
    );

    setSelectedIntegration(integration);
    setConfigApiKey(userIntegration?.apiKey || "");
    setConfigIsActive(userIntegration?.isActive || false);
    setConfigDialogOpen(true);
  };

  const saveIntegrationConfig = async () => {
    if (!selectedIntegration || !configApiKey.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "API Key é obrigatória",
      });
      return;
    }

    try {
      setSaving(true);

      const existingIntegration = userData.integrations.find(
        (integration) => integration.name === selectedIntegration.name
      );

      if (existingIntegration) {
        // Update existing integration
        console.log(
          `[FRONTEND] Updating existing integration: ${selectedIntegration.name}`
        );
        const response = await axios.put("/api/user/integrations", {
          integrationName: selectedIntegration.name,
          apiKey: configApiKey,
          isActive: configIsActive,
        });

        console.log(`[FRONTEND] PUT response:`, response.data);
        if (response.data.status === "success") {
          setUserData((prev) => ({
            ...prev,
            integrations: prev.integrations.map((integration) =>
              integration.name === selectedIntegration.name
                ? {
                    ...integration,
                    apiKey: configApiKey,
                    isActive: configIsActive,
                  }
                : integration
            ),
          }));
          console.log(
            `[FRONTEND] Successfully updated local state for ${selectedIntegration.name}`
          );
        }
      } else {
        // Create new integration
        console.log(
          `[FRONTEND] Creating new integration: ${selectedIntegration.name}`
        );
        const response = await axios.post("/api/user/integrations", {
          name: selectedIntegration.name,
          apiKey: configApiKey,
          isActive: configIsActive,
        });

        console.log(`[FRONTEND] POST response:`, response.data);
        if (response.data.status === "success") {
          setUserData((prev) => ({
            ...prev,
            integrations: [
              ...prev.integrations,
              response.data.data.integration,
            ],
          }));
          console.log(
            `[FRONTEND] Successfully created and added to local state: ${selectedIntegration.name}`
          );
        }
      }

      toast({
        title: "Sucesso",
        description: "Configuração salva com sucesso",
      });

      setConfigDialogOpen(false);
    } catch (error) {
      console.error("Error saving integration config:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao salvar configuração",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleIntegrationStatus = async (
    integrationName: string,
    currentStatus: boolean
  ) => {
    try {
      setUpdating(integrationName);

      if (currentStatus) {
        // Deactivate existing integration
        const response = await axios.patch("/api/user/integrations", {
          integrationName,
          isActive: false,
        });

        if (response.data.status === "success") {
          setUserData((prev) => ({
            ...prev,
            integrations: prev.integrations.map((integration) =>
              integration.name === integrationName
                ? { ...integration, isActive: false }
                : integration
            ),
          }));

          toast({
            title: "Sucesso",
            description: "Integração desativada com sucesso",
          });
        }
      } else {
        // Check if integration exists in user data
        const existingIntegration = userData.integrations.find(
          (integration) => integration.name === integrationName
        );

        if (existingIntegration) {
          // Activate existing integration
          const response = await axios.patch("/api/user/integrations", {
            integrationName,
            isActive: true,
          });

          if (response.data.status === "success") {
            setUserData((prev) => ({
              ...prev,
              integrations: prev.integrations.map((integration) =>
                integration.name === integrationName
                  ? { ...integration, isActive: true }
                  : integration
              ),
            }));

            toast({
              title: "Sucesso",
              description: "Integração ativada com sucesso",
            });
          }
        } else {
          // Need to configure first
          toast({
            variant: "destructive",
            title: "Configuração necessária",
            description:
              "Configure a API Key primeiro usando o botão de configurações",
          });
        }
      }
    } catch (error) {
      console.error("Error updating integration:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao atualizar integração",
      });
    } finally {
      setUpdating(null);
    }
  };

  // Get integration status from user data
  const getIntegrationStatus = (integrationName: string) => {
    const userIntegration = userData.integrations.find(
      (integration) => integration.name === integrationName
    );
    return userIntegration?.isActive || false;
  };

  // Get integration API key from user data
  const getIntegrationApiKey = (integrationName: string) => {
    const userIntegration = userData.integrations.find(
      (integration) => integration.name === integrationName
    );
    return userIntegration?.apiKey;
  };

  React.useEffect(() => {
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <>
        <DashboardHeader
          heading="Integrações"
          text="Conecte suas plataformas educacionais favoritas para importar turmas e alunos automaticamente."
        />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardHeader
        heading="Integrações"
        text="Conecte suas plataformas educacionais favoritas para importar turmas e alunos automaticamente."
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Integração
        </Button>
      </DashboardHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {availableIntegrations.map((integration) => {
          const isActive = getIntegrationStatus(integration.name);
          const apiKey = getIntegrationApiKey(integration.name);

          return (
            <Card
              key={integration.id}
              className="transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {typeof integration.icon === "string" ? (
                        <div className="text-2xl">{integration.icon}</div>
                      ) : (
                        <Image
                          src={integration.icon}
                          alt={integration.displayName}
                          width={32}
                          height={32}
                        />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {integration.displayName}
                      </CardTitle>
                      <div className="mt-1">{getStatusBadge(isActive)}</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openConfigDialog(integration)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    {isActive && (
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {integration.description}
                </CardDescription>

                <div className="space-y-4">
                  {isActive && apiKey && (
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>API Key:</span>
                        <span className="font-mono text-xs">
                          {apiKey.substring(0, 8)}...
                        </span>
                      </div>
                    </div>
                  )}

                  {!isActive && (
                    <div className="text-sm text-muted-foreground">
                      Ative esta integração para começar a sincronizar dados.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Configuration Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Configurar {selectedIntegration?.displayName}
            </DialogTitle>
            <DialogDescription>
              Configure a API Key e o status da integração{" "}
              {selectedIntegration?.displayName}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Digite sua API Key"
                value={configApiKey}
                onChange={(e) => setConfigApiKey(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="status">Status da integração</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {configIsActive ? "Ativo" : "Inativo"}
                </span>
                <Switch
                  id="status"
                  checked={configIsActive}
                  onCheckedChange={setConfigIsActive}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfigDialogOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              onClick={saveIntegrationConfig}
              disabled={saving || !configApiKey.trim()}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
