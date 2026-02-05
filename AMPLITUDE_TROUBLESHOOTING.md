# Troubleshooting Amplitude A/B Testing

## Problema: Flag sempre retorna "control"

Se no console você vê:
```
📊 Variant para "teste-a-b-banner-50-100-off": control
⚠️ Flag "teste-a-b-banner-50-100-off" não encontrada ou sem valor
```

Isso significa que o Amplitude Experiment não conseguiu encontrar sua feature flag. Siga este checklist:

## Checklist de Configuração

### 1. Feature Flag foi criada no Amplitude?

- [ ] Acesse: https://amplitude.com → seu projeto → **Experiment** ou **Feature Flags**
- [ ] Clique em **Create** ou **New Flag**
- [ ] Verifique se existe uma flag com key: `teste-a-b-banner-50-100-off`
- [ ] **Se não existe**, crie agora (veja instruções abaixo)

### 2. Feature Flag está ATIVA (Launched)?

- [ ] Acesse a flag `teste-a-b-banner-50-100-off`
- [ ] Verifique o status: deve estar **"Running"** ou **"Active"**
- [ ] Se status é "Draft" ou "Archived", **ative agora**
- [ ] Clique em **Launch** se necessário

### 3. Variantes estão corretas?

- [ ] Dentro da feature flag, verifique as variantes:
  - [ ] Variante 1: **key** `control_50off` ou **value** `control_50off`
  - [ ] Variante 2: **key** `treatment_100off` ou **value** `treatment_100off`
- [ ] Os valores devem ser **exatamente** esses (case-sensitive)
- [ ] Não podem estar vazios

### 4. Allocation (distribuição) está configurada?

- [ ] Verifique se ambas as variantes têm alocação > 0%
- [ ] Exemplo válido:
  - control_50off: 50%
  - treatment_100off: 50%
- [ ] A soma deve ser 100%

### 5. Targeting está correto?

- [ ] Se há targeting rules, verifique se você cumpre os critérios
- [ ] Se não há targeting, a flag deve aplicar a **todos os usuários**
- [ ] Verifique **User Targeting** ou **Targeting Rules**

### 6. Amplitude SDK foi inicializado?

- [ ] Abra o console (F12) e procure por:
  ```
  ✅ Amplitude inicializado com sucesso!
  📍 Device ID em uso: device_...
  ```
- [ ] Se não vir, o Amplitude Analytics não foi inicializado antes do Experiment

### 7. API Key está correta?

- [ ] No `.env.local`, verifique:
  ```
  VITE_AMPLITUDE_API_KEY=0dd761abeb204ed66f808d27daae4c3
  ```
- [ ] Essa chave deve estar correta
- [ ] Pode variar entre ambientes (dev/staging/prod)

## Logs para Verificar

Abra o console do navegador (F12 → Console) e procure por:

### Inicialização Amplitude
```
✅ Amplitude inicializado com sucesso!
📍 Device ID em uso: device_1707...
```

### Inicialização Experiment Client
```
🔄 Inicializando Experiment client...
📍 API Key: 0dd761abeb...
📍 User ID: (seu user id ou "anonymous")
📍 Device ID: device_1707...
✅ Experiment client inicializado com sucesso!
📍 Experiment client flags: {...}
```

### Busca da Variante
```
🔍 Buscando variante para flag: "teste-a-b-banner-50-100-off"
📊 Variant para "teste-a-b-banner-50-100-off": control_50off (ou treatment_100off)
📊 Variant objeto completo: {value: "control_50off", ...}
```

### Banner Variant Status
```
🎯 Banner Variant Status:
  - Loading: false
  - Variant: control_50off (ou treatment_100off)
  - Banner visível: true (ou false)
```

## Soluções Comuns

### Problema: Vejo "control" e aviso de flag não encontrada

**Causa**: Feature flag não existe ou não está ativa

**Solução**:
1. Acesse Amplitude → Experiments → Feature Flags
2. Crie a flag `teste-a-b-banner-50-100-off` com:
   - **Variante 1**: `control_50off`
   - **Variante 2**: `treatment_100off`
3. Configure alocação 50/50
4. Clique em **Launch**
5. Espere alguns segundos e recarregue a página

### Problema: Sempre retorna a mesma variante

**Causa**: Device ID é consistente (esperado!)

**Solução**: O Amplitude usa Device ID para determinar qual variante você vê. É normal ver sempre a mesma:
- Limpe localStorage: 
  ```javascript
  localStorage.removeItem('amp_device_id')
  ```
- Recarregue a página para gerar novo Device ID
- Agora você deve ver a outra variante

### Problema: Vejo erros de CORS ou conexão

**Causa**: Problema de conectividade com Amplitude

**Solução**:
1. Verifique conexão de internet
2. Verifique se API Key é válida
3. Teste em incógnito (sem cache)
4. Verifique se firewall/proxy bloqueia Amplitude

## Como Resetar para Testar

Se quiser forçar uma variante específica para testar:

1. **Opção 1 - Limpar Device ID**:
   ```javascript
   // No console (F12)
   localStorage.removeItem('amp_device_id');
   location.reload();
   ```

2. **Opção 2 - Usar Targeting Rules no Amplitude**:
   - Crie uma rule: "only for users with email containing @test"
   - Use um email diferente para testar

3. **Opção 3 - QA Links no Amplitude** (se disponível no plano)
   - Amplitude oferece links especiais para forçar variantes específicas

## Validação Final

Depois de tudo configurado, você deve ver no console:

✅ Amplitude inicializado  
✅ Experiment client inicializado  
✅ Variant encontrada (não mais "control")  
✅ Banner muda de aparência baseado na variante  

Se conseguir ver isso, o teste A/B está funcionando corretamente!
