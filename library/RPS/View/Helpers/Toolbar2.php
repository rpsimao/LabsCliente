<?php
require_once ('Zend/View/Helper/Abstract.php');
/** 
 * @author rpsimao
 * 
 * 
 */
class RPS_View_Helpers_Toolbar2 extends Zend_View_Helper_Abstract
{
    protected $html;
    
    
    public function Toolbar2()
    {
        $this->authUser = Zend_Auth::getInstance()->getIdentity();
		$username = $this->authUser->username;
			    	
		$userMatch = new RPS_UserService_Match();
		$userMatch->setUsername($username);
		$this->labOptimus = $userMatch->labName();
			    	
		$this->optimus = new RPS_UserService_Optimus();
		$this->optimus->setLabName($this->labOptimus['laboptimus']);
			    	
		
			    	
		$jobsProducao = $this->optimus->getAllFromJobTableProducaoByLab($this->labOptimus['laboptimus']);
		$totalProducao = count($jobsProducao);
			    //
		$registosProvas = $this->optimus->getJobsInProvas($this->labOptimus['laboptimus']);
		$totalProvas = count($registosProvas);
			    //
		$jobsEntregues = $this->optimus->getAllFromJobTableEntreguesByLab($this->labOptimus['laboptimus']);
		$totalEntregas = count($jobsEntregues);
			    //
		$registos = $this->optimus->getJobsYearly();
		$totalRegistos = count($registos);
        
        
        $this->html = '<table>
	<tr>
		<td id="botao-lab-producao">
			<span id="splash-producao" class="splash">'.$totalProducao.'</span>
			<a href="/lab/producao"> <img id="image-producao" src="/images/2.0/producao.jpg" alt="Producao" style="border: none" />
		</td>
		<td id="botao-lab-provas">
			<span id="splash-provas" class="splash">'.$totalProvas.'</span>
			<a href="/lab/provas"> <img id="image-provas" src="/images/2.0/provas.jpg" alt="Prova" style="border: none" />
		</td>
		<td id="botao-lab-registos">
			<span id="splash-registos" class="splash">'.$totalRegistos.'</span>
			<a href="/lab/registos"> <img id="image-registos" src="/images/2.0/registos.jpg" alt="Registos" style="border: none" />
		</td>
		<td id="botao-lab-entregas">
			<span id="splash-entregas" class="splash">'.$totalEntregas.'</span>
			<a href="/lab/entregas"> <img id="image-entregas" src="/images/2.0/entregas.jpg" alt="Entregas" style="border: none" />
		</td>
		<td>
			<a href="/logout"> <img src="/images/2.0/sair.jpg" alt="Sair" style="border: none" />
		</td>
	</tr>
</table>';
        
        return $this->html;
        
        
    }
}
?>

