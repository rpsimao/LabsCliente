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
        	case 'Auxiliar M�quina 006':
        	return 'Impress�o';
        	break;
        	case 'Espera de aprova��o':
        	return 'Acabamentos';
        	break;
        	case 'Auxiliar M�quina 119':
        	return 'Acabamentos';
        	break;
        	case 'Auxiliar M�quina 112':
        	return 'Acabamentos';
        	break;
        	case 'Desenhar/Paginar embalagem':
        	return 'Prepress';
        	case 'Falta de trabalho':
        	return 'Prepress';
        	break;
        	case 'Mudan�a de cor directa':
        	return 'Impress�o';
        	break;
        	case 'Afina��o da impress�o':
        	return 'Impress�o';
        	break;
        	case 'Auxiliar M�quina 007':
        	return 'Impress�o';
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
        	return 'Impress�o';
        	break;
        	case 'Auxiliar M�quina 109':
        	return 'Impress�o';
        	break;
        	case 'Espera de chapas':
        	return 'Impress�o';
        	break;
        	case 'Cortar e vincar sem descasque':
        	return 'Acabamentos';
        	break;
        	case 'Afinar para cortar e vincar':
        	return 'Acabamentos';
        	break;
        	case 'Cortar papel/cartolina branco':
        	return 'Impress�o';
        	break;
        	case 'Gera��o de pdf\'s':
        	return 'Prepress';
        	break;
        	case 'Afinar corte e vinco c/ descas':
        	return 'Acabamentos';
        	break;
        	case 'Afinar corte e vinco s/ descas':
        	return 'Acabamentos';
        	break;
        	case 'Limpeza da m�quina':
        	return 'Acabamentos';
        	break;
        	case 'Auxiliar M�quina 120':
        	return 'Impress�o';
        	break;
        	case 'Auxiliar M�quina 082':
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
        	return 'Impress�o';
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