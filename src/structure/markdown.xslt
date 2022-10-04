<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
    <xsl:output method="text" encoding="utf-8"/>
    <xsl:template match="/">
        <xsl:text># TODO Заголовок вставить &#13;</xsl:text>
        <xsl:apply-templates select="/root/toc/chapter"/>
        <xsl:text># Цитаты&#13;&#13;</xsl:text>
        <xsl:apply-templates select="/root/annotations/annotation"/>
    </xsl:template>
    <xsl:template match="chapter">
        <xsl:text>## </xsl:text>
        <xsl:value-of select="./@label"/>
        <xsl:text>&#13;&#13;</xsl:text>
    </xsl:template>
    <xsl:template match="annotation">
        <xsl:value-of select="."/>
        <xsl:text>&#13;&#13;</xsl:text>
    </xsl:template>
</xsl:stylesheet>
