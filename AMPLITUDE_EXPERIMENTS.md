# Amplitude Experiments - Feature Flags Documentation

## Overview

Este projeto está configurado para usar Feature Flags do Amplitude para realizar testes A/B. Atualmente, temos um teste configurado para o banner principal da página.

## Teste A/B: Banner

**Feature Flag Key:** `teste-a-b-banner-50-100-off`

### Variantes

- **control_50off**: Exibe o banner padrão com fundo bege (#fbf7ef), conteúdo (título, badge, CTA) e imagem de fundo
- **treatment_100off**: Exibe um banner em branco (background branco, sem conteúdo visível)

### Implementação

A implementação está no arquivo `client/pages/Index.tsx`:

1. **Hook de Experiment**: `useExperimentVariant` do `client/hooks/useExperiment.ts`
   ```typescript
   const { variant: bannerVariant, loading: bannerVariantLoading } =
     useExperimentVariant("teste-a-b-banner-50-100-off");
   ```

2. **Condicionalização Mobile**:
   - Background: Muda de `#FBF7EF` (bege) para `#ffffff` (branco) baseado na variante
   - Conteúdo: É ocultado (display: none) quando `bannerVariant === "on"`

3. **Condicionalização Desktop**:
   - Background: Muda de `#fbf7ef` (bege) para `#ffffff` (branco)
   - Background Image: Removida quando `bannerVariant === "on"`
   - Conteúdo: É ocultado (display: none) quando `bannerVariant === "on"`

## Como Configurar no Amplitude

### 1. Acessar o Amplitude

1. Abra [https://amplitude.com](https://amplitude.com)
2. Faça login com sua conta
3. Navegue até seu projeto

### 2. Criar um Novo Experimento

1. Vá para **Experiments** (ou **Feature Flags** dependendo do plano)
2. Clique em **Create Experiment**
3. Preencha os dados:
   - **Name**: Banner A/B Test (50% / 100% Off)
   - **Description**: Test displaying blank banner vs standard banner
   - **Feature Flag Key**: `teste-a-b-banner-50-100-off`

### 3. Criar as Variantes

1. **Control Variant**:
   - Name: `control_50off`
   - Value: `control_50off`
   - Descrição: Show standard banner with background and content

2. **Variant (Test)**:
   - Name: `treatment_100off`
   - Value: `treatment_100off`
   - Descrição: Show blank white banner without content

### 4. Definir Targeting

1. **Allocation**:
   - Control: 50%
   - Variant: 50%

2. **Targeting** (opcional):
   - Pode adicionar regras para diferentes grupos de usuários
   - Exemplo: Only for new visitors, specific devices, etc.

### 5. Ativar o Experimento

1. Revise as configurações
2. Clique em **Launch**
3. O experimento iniciará imediatamente

## Como Funciona no Código

### Hook `useExperimentVariant`

```typescript
const { variant: bannerVariant, loading: bannerVariantLoading } =
  useExperimentVariant("teste-a-b-banner-50-100-off");
```

- **variant**: O valor da variante atribuída ao usuário ("control" ou "on")
- **loading**: Indicador de carregamento enquanto busca a variante

### Rastreamento de Eventos

Todos os cliques no banner são rastreados automaticamente:
- `clickBannerContratar()` - Click no botão "Contratar plano"
- `clickConsulteRegulamento()` - Click no link do regulamento
- `trackScreenView()` - View da página

Esses eventos incluem propriedades como:
- `device_category` (mobile/desktop)
- `operating_system`
- `page_url`
- `event_timestamp`

## Adicionar Novos Testes

Para adicionar um novo teste A/B:

1. **Criar Feature Flag no Amplitude**
2. **Usar o hook no código**:
   ```typescript
   import { useExperimentVariant } from "../hooks/useExperiment";
   
   const { variant, loading } = useExperimentVariant("seu-flag-key");
   ```
3. **Condicionar o comportamento**:
   ```typescript
   {variant === "variant-1" ? <ComponentA /> : <ComponentB />}
   ```

## Variáveis de Ambiente

```env
VITE_AMPLITUDE_API_KEY=0dd761abeb204ed66f808d27daae4c3
```

## Debugging

No console do navegador (F12 → Console), você verá mensagens como:

```
✅ Experiment client inicializado com sucesso!
📊 Variant para "teste-a-b-banner-50-100-off": treatment_100off
📊 Variant objeto completo: {value: "treatment_100off", payload: {...}}
```

Se ver `control_50off`, significa que o usuário foi atribuído ao grupo de controle (banner normal).
Se ver `treatment_100off`, significa que o usuário vê o banner em branco (teste).

Se não estiver funcionando, verifique:
- [ ] API Key está configurada em `.env.local`
- [ ] Feature Flag foi criada no Amplitude
- [ ] Experimento está ativo (Launch)
- [ ] DeviceId está sendo gerado e armazenado

## Métricas Importantes

Acompanhe no Amplitude:
- **Conversion Rate**: % de usuários que clicaram em "Contratar plano"
- **Page Views**: Visualizações por variante
- **User Engagement**: Tempo na página e interações

## Suporte

Para mais informações sobre Amplitude Experiments:
- [Amplitude Experiment Docs](https://www.docs.developers.amplitude.com/experiment/quickstart/)
- [Feature Flags Best Practices](https://www.amplitude.com/blog/feature-flags)
