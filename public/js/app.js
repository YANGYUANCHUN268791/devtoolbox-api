const API_BASE = '/api/tool/';
let currentTool = null;

function openTool(toolId) {
  currentTool = toolId;
  const workspace = document.getElementById('workspace');
  workspace.style.display = 'block';
  document.getElementById('toolTitle').textContent = document.querySelector(`[onclick="openTool('${toolId}')"]`).querySelector('.tool-card-name').textContent;
  document.getElementById('inputBox').value = '';
  document.getElementById('outputBox').value = '';
  document.getElementById('proNote').style.display = 'none';
  workspace.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeWorkspace() {
  document.getElementById('workspace').style.display = 'none';
}

async function processTool() {
  const input = document.getElementById('inputBox').value;
  if (!input && currentTool !== 'uuid') return;
  
  const outputBox = document.getElementById('outputBox');
  outputBox.value = 'Processing...';
  
  try {
    const res = await fetch(API_BASE + currentTool, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, isPro: false })
    });
    const data = await res.json();
    if (data.error) {
      outputBox.value = 'Error: ' + data.error;
    } else {
      outputBox.value = data.result;
      if (data.proNote) {
        document.getElementById('proNote').style.display = 'inline';
      }
    }
  } catch (e) {
    outputBox.value = 'Error: ' + e.message;
  }
}

function clearTool() {
  document.getElementById('inputBox').value = '';
  document.getElementById('outputBox').value = '';
}

function copyResult() {
  const output = document.getElementById('outputBox');
  output.select();
  navigator.clipboard.writeText(output.value).then(() => {
    const btn = event.target;
    const orig = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = orig, 1500);
  });
}

function purchasePro() {
  alert('To purchase DevToolBox Pro (199 RMB):\n\n1. Send payment via Alipay to: cao63571@gmail.com\n2. Email us at the same address with your payment receipt\n3. You will receive Pro access within 2 hours\n\nOr contact us directly for instant activation.');
}

function purchaseEnterprise() {
  alert('Enterprise license (499 RMB) - includes full source code and commercial rights.\nContact: cao63571@gmail.com');
}
