ao realizar um pagamento, deve ser lançado na fatura aberta
ao incluir um lançamento, lança na fatura aberta (refatorar posting para nao receber idFatura, talvez fazer outro endpoint)

# ???? se nao houver fatura aberta, chamar o serviço que fecha/cria a fatura e lançar na nova fatura

serviço de fechar/criar a fatura
  - diariamente roda uma rotina para todos os clientes
  - fecha todas as faturas abertas
  - cria uma nova fatura para a competencia corrente e deixa aberta
  - lança os serviços do cliente dentro da fatura
  - calcula o total de creditos recebidos e o total de debitos    da fatura anterior.
    - se houver diferença, lança um debito do valor restante na fatura aberta
    - calcula os juros da diferença e lança um debito na fatura aberta


criar endpoint que verifica se o cliente esta em atraso e faz bloqueio do serviço