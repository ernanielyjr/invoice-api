- ao incluir um lançamento (debito/credito), lançar na fatura aberta
  - refatorar posting route para nao receber invoiceId e sim customerId, talvez fazer um novo endpoint
  - se nao houver fatura aberta
      - criar uma nova fatura
      - lançar serviços recorrentes nela
      - lançar um saldo anterior com 0 (zero)
      - colocar o lançamento em questão nela

- pagar fatura (pagseguro)
- criar endpoint que verifica se o cliente esta em atraso e faz bloqueio do serviço
- endpoint de notificação do pagseguro


Passos para cadastrar um cliente:
  Cria o customer com invoiceMaturity
  Cria o(s) serviço(s) de hospedagem com valor positivo
  Gerar first invoice para o cliente
  Lançar postings de serviços avulsos

Fechar todas faturas com force
Enviar emails


FIXME: verificar datas e vencimentos nos emails e na fatura (gauti-cli)
TODO: rotina que fecha faturas
TODO: rotina que envia emails