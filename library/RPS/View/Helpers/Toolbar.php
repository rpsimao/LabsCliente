<?php
require_once ('Zend/View/Helper/Abstract.php');
/** 
 * @author rpsimao
 * 
 * 
 */
class RPS_View_Helpers_Toolbar extends Zend_View_Helper_Abstract
{
    protected $html;
    
    
    public function Toolbar()
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
		<td>
			<span class="splash">'.$totalProducao.'</span>
			<a href="/lab/producao"> <img src="/images/producao.jpg" height="36px" width="36px" alt="Producao" style="border: none" />
		</td>
		<td>
			<span class="splash">'.$totalProvas.'</span>
			<a href="/lab/provas"> <img src="/images/provas.jpg" height="36px" width="40px" alt="Prova" style="border: none" />
		</td>
		<td>
			<span class="splash">'.$totalRegistos.'</span>
			<a href="/lab/registos"> <img src="/images/registos.jpg" height="36px" width="36px" alt="Registos" style="border: none" />
		</td>
		<td>
			<span class="splash">'.$totalEntregas.'</span>
			<a href="/lab/entregas"> <img src="/images/entregas.jpg" height="36px" width="36px" alt="Entregas" style="border: none" />
		</td>
		<td>
			<a href="/logout"> <img src="/images/sair.jpg" height="36px" width="36px" alt="Sair" style="border: none" />
		</td>
	</tr>
	<tr>
		<td>
			Produ&ccedil;&atilde;o
		</td>
		<td>
			Provas
		</td>
		<td>
			Registos
		</td>
		<td>
			Entregas
		</td>
		<td>
			Sair
		</td>
	</tr>
</table>';
        
        return $this->html;
        
        
    }
}
?>

