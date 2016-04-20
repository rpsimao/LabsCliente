<?php

/**
 * Classe para efectura pedidos à base de dados do Backstage server (MSSQL Server)
 * 
 * @author Ricardo Simao
 * @version 1.0
 * @copyright Fernandes & Terceiro, S.A.
 * @package Embalagem Database
 * 
 * @abstract Ultima revisao - 14/08/2009
 */
class RPS_UserService_Backstage extends RPS_Config_DB_Backstage
{
    /**
     * Executa o pedido à base de dados
     * @var string
     */
    protected $query;
    /**
     * Guarda num array o pedido feito à base de dados.
     * @var array
     */
    protected $row;
    
    
    function __construct ()
    {

        parent::__construct();
    }

    public function getValuesSubOrderID ($subOrderId)
    {

        mssql_connect($this->server, $this->user, $this->passwd) or die('N&atilde;o foi poss&iacute;vel ligar ao Servidor MSSQL');
        mssql_select_db($this->database) or die('N&atilde;o foi poss&iacute;vel aceder &agrave; tabela Jobs');
        $query = mssql_query("SELECT * from Jobs where SubOrderId ='$subOrderId'");
        $row = mssql_fetch_array($query);
        return $row;
    }

    public function getValuesProjectID ($projectID)
    {

        mssql_connect($this->server, $this->user, $this->passwd) or die('N&atilde;o foi poss&iacute;vel ligar ao Servidor MSSQL');
        mssql_select_db($this->database) or die('N&atilde;o foi poss&iacute;vel aceder &agrave; tabela Jobs');
        $query = mssql_query("SELECT * from Jobs where ProjectId ='$projectID'");
        $row = mssql_fetch_array($query);
        return $row;
    }
}
?>