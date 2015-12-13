package com.sensia.swetools.editors.sensorml.client.panels.elements.sml;

import com.google.gwt.user.client.ui.HasHorizontalAlignment;
import com.google.gwt.user.client.ui.HorizontalPanel;
import com.google.gwt.user.client.ui.Label;
import com.google.gwt.user.client.ui.Panel;
import com.google.gwt.user.client.ui.Widget;
import com.sensia.swetools.editors.sensorml.client.AbstractSensorWidget;
import com.sensia.swetools.editors.sensorml.client.panels.elements.base.RNGAttributeDefinitionWidget;

public class SMLIdentifierWidget extends AbstractSensorWidget{

	private HorizontalPanel container;
	private HorizontalPanel defPanel;
	private HorizontalPanel contentPanel;
	
	private boolean first = true;
	
	public SMLIdentifierWidget() {
		super("", "");
		container = new HorizontalPanel();
		contentPanel = new HorizontalPanel();
		defPanel = new HorizontalPanel();
		
		container.setHorizontalAlignment(HasHorizontalAlignment.ALIGN_LEFT);
		contentPanel.setHorizontalAlignment(HasHorizontalAlignment.ALIGN_LEFT);
		defPanel.setHorizontalAlignment(HasHorizontalAlignment.ALIGN_LEFT);
		
		container.add(contentPanel);
		container.add(defPanel);
		
		contentPanel.addStyleName("swe-property-panel");
	}

	@Override
	public Widget getWidget() {
		return container;
	}

	@Override
	public Panel getPanel() {
		return container;
	}

	@Override
	public void addPanel(AbstractSensorWidget widget) {
		if(widget instanceof RNGAttributeDefinitionWidget) {
			defPanel.add(widget.getWidget());
		} else {
			if(first) {
				first = false;
			}else {
				//TODO determine panel width
				int offset = widget.getPanel().getElement().getOffsetWidth();
				contentPanel.add(new Label(getNormalizedLabel(110)));
			}
			contentPanel.add(widget.getPanel());
		}
	}	
}
