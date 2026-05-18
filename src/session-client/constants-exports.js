goog.module('omid.sessionClient.ConstantsExport');

const {CreativeType, ImpressionType, VideoPlayerState, InteractionType, ErrorType} = goog.require('omid.common.constants');
const VastProperties = goog.require('omid.common.VastProperties');
const {packageExport} = goog.require('omid.common.exporter');

packageExport('OmidSessionClient.CreativeType', CreativeType);
packageExport('OmidSessionClient.ImpressionType', ImpressionType);
packageExport('OmidSessionClient.VideoPlayerState', VideoPlayerState);
packageExport('OmidSessionClient.InteractionType', InteractionType);
packageExport('OmidSessionClient.ErrorType', ErrorType);
packageExport('OmidSessionClient.VastProperties', VastProperties);
