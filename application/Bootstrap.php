<?php
class Bootstrap extends Zend_Application_Bootstrap_Bootstrap
{

    protected function _initAutoload()
    {
        $loader = Zend_Loader_Autoloader::getInstance();
        $loader->registerNamespace('RPS_');
        $loader->setFallbackAutoloader(true);
    }

    protected function _initRegistry()
    {
        Zend_Registry::set('optimus', new Zend_Config_Ini(APPLICATION_PATH . '/configs/application.ini', 'optimus'));
        Zend_Registry::set('embalagem', new Zend_Config_Ini(APPLICATION_PATH . '/configs/application.ini', 'embalagem'));
        Zend_Registry::set('backstage', new Zend_Config_Ini(APPLICATION_PATH . '/configs/application.ini', 'backstage'));
        Zend_Registry::set('authentication', new Zend_Config_Ini(APPLICATION_PATH . '/configs/application.ini', 'authentication'));
    }

    protected function _initRoutes()
    {
        /**
         * 
         * @var unknown_type
         */
        $router = Zend_Controller_Front::getInstance()->getRouter();
        /**
         * 
         * @var unknown_type
         */
        $route = new Zend_Controller_Router_Route('/cockpit/*', array(
            
            'controller' => 'cockpit' , 
            'action' => 'index'
        ));
        $router->addRoute('cockpit', $route);
    }

  
    protected function _initHeader() {
        $this->bootstrap('layout');
        $layout = $this->getResource('layout');
        $view = $layout->getView();
        $view->addHelperPath("RPS/View/Helpers", "RPS_View_Helpers");
        $view->doctype("XHTML1_STRICT");
        $view->headTitle('Fernandes & Terceiro, S.A. :: Embalagem Database');
        $view->headMeta()->appendHttpEquiv('Content-Language', 'pt-PT');
        $view->headMeta()->appendHttpEquiv('X-UA-Compatible', 'chrome=1');
        $view->headMeta()->appendName('Developer', 'Ricardo Simao');
        $view->headMeta()->appendName('Email', 'ricardo.simao@fterceiro.pt');
        $view->headMeta()->appendName('Copyright', 'Fernandes e Terceiro, S.A.');
        $view->headMeta()->appendName('Version', '@@BuildNumber@@');
        $view->headMeta()->appendName('BuildDate', '@@BuildDate@@');
        $view->headLink()->headLink(array('rel' => 'favicon', 'href' => 'http://static.fterceiro.pt/assets/public/images/favicon.ico'), 'PREPEND');
        $view->headLink()->headLink(array('rel' => 'icon', 'href' => 'http://static.fterceiro.pt/assets/public/images/favicon.ico'), 'PREPEND');
        $view->headLink()->appendStylesheet($view->baseUrl().'/css/style2.0.css');
        $view->headLink()->appendStylesheet('http://static.fterceiro.pt/assets/private/css/smoothness/smothness.css');
        $view->headScript()->appendFile('http://cdn.fterceiro.pt/library/js/jquery/latest/min.js');
        $view->headScript()->appendFile('http://cdn.fterceiro.pt/library/js/jqueryui/latest/min.js');
        $view->headScript()->appendFile('/js/effects.js');
        
        
        
        
    }
    
    
}

