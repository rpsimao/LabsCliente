<?php

class RPS_Helpers_MachineToHumanCostCenter
{

    public static function translate ($code)
    {

        $optimus = new RPS_UserService_Optimus();
        $name = $optimus->machineToHuman($code);
        return $name['act_name'];
    }
    
    
    public static function clean($costCenter)
    {
        
        switch ($costCenter) {
        	case 'Auxiliar Mсquina 006':
        	return 'Impressуo';
        	break;
        	case 'Espera de aprovaчуo':
        	return 'Acabamentos';
        	break;
        	case 'Auxiliar Mсquina 119':
        	return 'Acabamentos';
        	break;
        	case 'Auxiliar Mсquina 112':
        	return 'Acabamentos';
        	break;
        	case 'Desenhar/Paginar embalagem':
        	return 'Prepress';
        	case 'Falta de trabalho':
        	return 'Prepress';
        	break;
        	case 'Mudanчa de cor directa':
        	return 'Impressуo';
        	break;
        	case 'Afinaчуo da impressуo':
        	return 'Impressуo';
        	break;
        	case 'Auxiliar Mсquina 007':
        	return 'Impressуo';
        	break;
        	case 'Afinar c/vinco c/braille c/des':
        	return 'Acabamentos';
        	break;
        	case 'Cortar e vincar com descasque':
        	return 'Acabamentos';
        	break;
        	case 'Descasca':
        	return 'Acabamentos';
        	break;
        	case 'Afinar caixas fundo normal':
        	return 'Acabamentos';
        	break;
        	case 'Colagem de fundo normal':
        	return 'Acabamentos';
        	break;
        	case 'Cortar e vincar':
        	return 'Acabamentos';
        	break;
        	case 'Cortar papel/cartolina impress':
        	return 'Impressуo';
        	break;
        	case 'Auxiliar Mсquina 109':
        	return 'Impressуo';
        	break;
        	case 'Espera de chapas':
        	return 'Impressуo';
        	break;
        	case 'Cortar e vincar sem descasque':
        	return 'Acabamentos';
        	break;
        	case 'Afinar para cortar e vincar':
        	return 'Acabamentos';
        	break;
        	case 'Cortar papel/cartolina branco':
        	return 'Impressуo';
        	break;
        	case 'Geraчуo de pdf\'s':
        	return 'Prepress';
        	break;
        	case 'Afinar corte e vinco c/ descas':
        	return 'Acabamentos';
        	break;
        	case 'Afinar corte e vinco s/ descas':
        	return 'Acabamentos';
        	break;
        	case 'Limpeza da mсquina':
        	return 'Acabamentos';
        	break;
        	case 'Auxiliar Mсquina 120':
        	return 'Impressуo';
        	break;
        	case 'Auxiliar Mсquina 082':
        	return 'Acabamentos';
        	break;
        	case 'Afinar p/cortar e vincar':
        	return 'Acabamentos';
        	break;
        	case 'Descascar':
        	return 'Acabamentos';
        	break;
        	case 'Afinar corte e vinco c/braille':
        	return 'Acabamentos';
        	break;
        	
        	case 'Verif ficheiros incompleta mkt':
        	return 'Prepress';
        	break;
        	
        	case 'Verif ficheiros incompleta emb':
        	    return 'Prepress';
        	    break;
        	
        	case 'Colagem de canelado':
        	return 'Acabamentos';
        	break;
        	
        	case 'Embalar Diversos':
        	return 'Acabamentos';
        	break;
        	
        	case 'Espera de papel':
        	return 'Impressуo';
        	break;
        	
        	case 'Afinar c/vinco c/braille s/des':
        	    return 'Acabamentos';
        	    break;
        	
        	default:
        		return $costCenter;
        	break;
        }
        
        
        
    }
    
    
}
?>