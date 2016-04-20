<?php
/**
 * Classe para criar a imagem (thumbnail) da embalagem
 * 
 * @author Ricardo Simao
 * @version 1.0
 * @copyright Fernandes & Terceiro, S.A.
 * @package Embalagem Database
 * 
 * @abstract Ultima revisao - 10/05/2010
 */
class RPS_Files_CreateImages
{
    /**
     * Caminho onde está o ficheiro
     * @var string
     */
    protected $path;
    /**
     * Caminho final do ficheiro PDF
     * @var string
     */
    protected $srtPDF;
    /**
     * Caminho final do ficheiro jpeg
     * @var unknown_type
     */
    protected $output;

    /**
     * Define o caminho para o ficheiro
     * @param $path
     * @return string
     */
    public function setPath($path)
    {
        $this->path = $path;
        return $this;
    }

    public function setCodF3($codF3)
    {
        $this->codF3 = $codF3;
    }

    public function getCodF3()
    {
        return $this->codF3;
    }

    /**
     * Converte o pdf numa imagem
     * @return void
     */
    public function convert()
    {
        $strPDF = $this->path . "/temp/preview.pdf";
        $output = $this->path . "/temp/preview.jpg";
        exec("convert \"{$strPDF}\" -colorspace RGB -geometry 230 \"{$output}\"");
        unlink($strPDF);
    }

    public function convertFixed()
    {
        $strPDF = "/media/scope/thumbs/" . $this->getCodF3() . ".pdf";
        $output = "/media/scope/thumbs/" . $this->getCodF3() . ".jpg";
        exec("convert \"{$strPDF}\" -colorspace RGB -geometry 230 \"{$output}\"");
        $this->reloadBugLocation();
        @unlink($strPDF);
    }

    /**
     * Converte o pdf do cortante numa imagem
     * @return void
     */
    public function convertCort()
    {
        $cortPDF = $this->path . "/temp/preview_cort.pdf";
        $cortJpg = $this->path . "/temp/preview_cort.jpg";
        exec("convert \"{$cortPDF}\" -colorspace RGB -geometry 550 \"{$cortJpg}\"");
        unlink($cortPDF);
    }

    /**
     * Roda as imagens
     * @param float $degree
     */
    public function rotateImages($degrees)
    {
        $source = '/media/scope/' . $this->path . "/temp/preview.jpg";
        exec("convert \"{$source}\" -rotate \"$degrees\" \"{$source}\"");
    }

    /**
     * Apaga as imagens
     */
    public function deleteImages()
    {
        $PDF = $this->path . "/temp/preview.pdf";
        $Jpg = $this->path . "/temp/preview.jpg";
        unlink($PDF);
        unlink($Jpg);
    }

    public function reloadBugLocation($id, $job)
    {
        header('Location: /cockpit/id/' . $id . '/job/' . $job);
    }
}
?>