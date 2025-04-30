const express = require('express');
const { list } = require('postcss');
const router = express.Router();


const listOnus = [
  {
    number: 1,
    frame: 0,
    slot: 1,
    port: 12,
    sn: "485754434A50C6AC",
    ontMAC: "108F-FE4D-8DA6",
    ontEquipmentSN: "2102314BUGRYP3923362",
    model: "HG8145V5-V2",
    ontAutofindTime: "2025-04-02T08:25:11"
  },
  {
    number: 2,
    frame: 0,
    slot: 2,
    port: 13,
    sn: "485754434A50C6AD",
    ontMAC: "108F-FE4D-8DA7",
    ontEquipmentSN: "2102314BUGRYP3923363",
    model: "HG8145V5-V2",
    ontAutofindTime: "2025-04-02T08:30:11"
  },
  {
    number: 3,
    frame: 0,
    slot: 3,
    port: 14,
    sn: "485754434A50C6AE",
    ontMAC: "108F-FE4D-8DA8",
    ontEquipmentSN: "2102314BUGRYP3923364",
    model: "HG8145V5-V3",
    ontAutofindTime: "2025-04-02T08:35:11"
  }
];

  router.get('/find', (req, res) => {
    res.json(listOnus);
  });

  const onusProv = [
    {
      fsp: "0/1/8",
      ontId: 90,
      ontStatus: "online",
      distance: 1815,
      cpu: "3%",
      temperature: "72(C)",
      desc: "marciotvoliveiras",
      lastUp: "2025-04-12 07:27:15-03:00",
      lastDown: "2025-04-12 07:24:11-03:00",
      onlineTime: "0 day(s), 5 hour(s), 10 minute(s), 50 second(s)",
      rx: "-25.08",
      tx: "2.07",
      model: "EG8145V5",
      sn: "485754435071849A",
      servicePort: null
    }
  ];

  

  router.get('/status/:sn', (req, res) => {
  const { sn } = req.params;
  const onu = onusProv.find(o => o.sn === sn);

  if (!onu) {
    return res.status(404).json({ mensagem: 'ONU não encontrada' });
  }

  res.json(onu);
});


// Rota /prov
router.post('/prov', (req, res) => {
  const { sn, vlan, pppoe, tecnico } = req.body;

  // Verifica se a ONT já foi provisionada
  const jaProvisionada = onusProv.find(onu => onu.sn === sn);
  if (jaProvisionada) {
    return res.status(400).json({
      dados: "Essa ONT já está provisionada!"
    });
  }

  // Busca a ONT no banco de descoberta
  const ont = listOnus.find(o => o.sn === sn);
  if (!ont) {
    return res.status(404).json({ dados: "ONT não encontrada para provisionamento!" });
  }

  // Cria uma nova entrada simulada de status
  const novaOnt = {
    fsp: `${ont.frame}/${ont.slot}/${ont.port}`,
    ontId: String(Math.floor(Math.random() * 100)).padStart(2, '0'), // ID aleatório só pra simular
    ontStatus: "online",
    distance: 2000,
    cpu: "5%",
    temperature: "65(C)",
    desc: tecnico || "sem descrição",
    tecnico: tecnico || null,
    lastUp: new Date().toISOString(),
    lastDown: null,
    onlineTime: "0 day(s), 0 hour(s), 1 minute(s), 0 second(s)",
    rx: "-24.00",
    tx: "2.10",
    model: ont.model,
    sn: ont.sn,
    servicePort: vlan || null,
    pppoe: pppoe || null
  
    
  };

  // Remove da lista de descobertas e adiciona na lista de provisionadas
  const index = listOnus.findIndex(o => o.sn === sn);
  if (index !== -1) {
    listOnus.splice(index, 1);
  }
  const dateOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit', 
    hour12: true 
  };
  const timestamp = new Date().toLocaleString('pt-BR', dateOptions); // Formata a data no formato brasileiro

  onusProv.push(novaOnt);

  return res.json({
    aviso: "ONT provisionada com sucesso!",
    horaData: `Hora e data do provisionamento: ${timestamp}`,
    ont: novaOnt
  });
});


router.post('/desprov', (req, res) => {
  const { sn, pppoe, tecnico } = req.body;

  if (
    sn === undefined || 
    pppoe === undefined || 
    tecnico === undefined

  ) {
    return res.status(400).json({ erro: "Parâmetros obrigatórios ausentes!" });
  }

  // Busca a ONT provisionada pelo SN e ontid
  const index = onusProv.findIndex(onu => onu.sn === sn);

  if (index === -1) {
    return res.status(404).json({ erro: "ONT não encontrada entre as provisionadas!" });
  }

  // Remove da lista de provisionadas
  const [ontRemovida] = onusProv.splice(index, 1);

  // Recria a ONT na lista de descobertas
  const novaOnt = {
    number: listOnus.length + 1,
    sn: sn,
    ontMAC: ontRemovida.ontMAC, 
    ontEquipmentSN: ontRemovida.ontEquipmentSN, 
    ontAutofindTime: new Date().toISOString()
  };
  
  listOnus.push(novaOnt);
  const dateOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit', 
    hour12: true 
  };
  const timestamp = new Date().toLocaleString('pt-BR', dateOptions);
  
  return res.json({
    dados: "ONT desprovisionada com sucesso!",
    ont: novaOnt,
    horaData: `Hora e data do desprovisionamento: ${timestamp}`
    
  });
  
});

router.get('/prov', (req, res) => {
  res.json(onusProv); // Retorna todas as ONUs provisionadas
});

module.exports = router;