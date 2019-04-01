-- =============================================
-- Authors:     Nicolas Six
-- Create Date: Mar 15, 2019
-- Description: <Returns contract members from a Contract ID>
-- =============================================
CREATE PROCEDURE [dbo].[GetContractPartiesFromContractId]
(
    @ContractID NVARCHAR(255)
)
AS
BEGIN
    SELECT vwu.EMAILADDRESS, ucm.USERID, vwcp.WORKFLOWPROPERTYVALUE
    FROM [dbo].[vwContractProperty] as vwcp
    INNER JOIN [dbo].[UserChainMapping] ucm on ucm.CHAINIDENTIFIER = vwcp.WORKFLOWPROPERTYVALUE
    INNER JOIN [dbo].[vwUser] vwu on vwu.ID = ucm.USERID
	WHERE vwcp.CONTRACTID = @ContractID
	AND vwcp.WORKFLOWPROPERTYNAME != 'Device'
	AND vwcp.WORKFLOWPROPERTYVALUE LIKE '0x%'
	AND vwcp.WORKFLOWPROPERTYVALUE NOT LIKE '0x0000000000000000000000000000000000000000'
	GROUP BY vwcp.WORKFLOWPROPERTYVALUE, vwu.EMAILADDRESS, ucm.USERID
END
GO